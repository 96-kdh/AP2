import http from "http";
import { loadEnv } from "./common/env";
import { MerchantAgentExecutor } from "./roles/merchant_agent/agentExecutor";
import { MerchantPaymentProcessorExecutor } from "./roles/merchant_payment_processor_agent/agentExecutor";
import { CredentialsProviderExecutor } from "./roles/credentials_provider_agent/agentExecutor";
import type { BaseServerExecutor } from "./common/baseServerExecutor";
import type { Message, Task } from "./common/a2aTypes";
import { InMemoryTaskUpdater } from "./common/simpleTaskUpdater";

interface AgentCard {
  name: string;
  description: string;
  url: string;
  preferredTransport: string;
  protocolVersion: string;
  version: string;
  capabilities: {
    extensions: Array<{ uri: string; description: string; required: boolean }>;
  };
}

interface AgentServerConfig {
  name: string;
  port: number;
  path: string;
  executor: BaseServerExecutor;
  card: AgentCard;
}

interface StartedServer {
  name: string;
  server: http.Server;
  port: number;
}

const PAYMENT_EXTENSION_URI = "https://github.com/google-agentic-commerce/ap2/v1";

function buildAgentCard(name: string, url: string, description: string): AgentCard {
  return {
    name,
    description,
    url,
    preferredTransport: "JSONRPC",
    protocolVersion: "0.3.0",
    version: "1.0.0",
    capabilities: {
      extensions: [
        {
          uri: PAYMENT_EXTENSION_URI,
          description: "Supports the Agent Payments Protocol.",
          required: true,
        },
      ],
    },
  };
}

function startServer(config: AgentServerConfig): Promise<StartedServer> {
  const handler = createHandler(config);
  const server = http.createServer(handler);

  return new Promise((resolve, reject) => {
    server.listen(config.port, "0.0.0.0", () => {
      // eslint-disable-next-line no-console
      console.log(`→ ${config.name} listening on http://localhost:${config.port}${config.path}`);
      resolve({ name: config.name, server, port: config.port });
    });
    server.on("error", reject);
  });
}

function createHandler(config: AgentServerConfig) {
  return async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    if (!req.url) {
      res.writeHead(400);
      res.end("Missing URL");
      return;
    }

    if (req.method === "GET" && (req.url === "/.well-known/agent.json" || req.url === "/agent.json")) {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(config.card, null, 2));
      return;
    }

    if (req.method === "POST" && req.url.startsWith(config.path)) {
      const rawBody = await readBody(req);
      try {
        const payload = rawBody ? (JSON.parse(rawBody) as { message?: Message; current_task?: Task; task?: Task }) : {};
        const message = payload.message;
        const currentTask = payload.current_task ?? payload.task;
        if (!message) {
          throw new Error("Missing message in request body");
        }

        const updater = new InMemoryTaskUpdater(message.context_id);
        try {
          await config.executor.execute({ message }, updater, currentTask);
          const task = updater.toTask(currentTask?.id);
          res.writeHead(200, { "content-type": "application/json" });
          res.end(JSON.stringify({ task }, null, 2));
        } catch (err) {
          const error = err instanceof Error ? err.message : String(err);
          res.writeHead(500, { "content-type": "application/json" });
          res.end(JSON.stringify({ error }));
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        res.writeHead(400, { "content-type": "application/json" });
        res.end(JSON.stringify({ error }));
      }
      return;
    }

    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found");
  };
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

async function closeServer(server: StartedServer): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  // eslint-disable-next-line no-console
  console.log(`← ${server.name} on port ${server.port} stopped`);
}

export async function startAgentServers(): Promise<{ stopAll: () => Promise<void> }> {
  loadEnv();

  const configs: AgentServerConfig[] = [
    {
      name: "Merchant Agent",
      port: 8001,
      path: "/a2a/merchant_agent",
      executor: new MerchantAgentExecutor(),
      card: buildAgentCard(
        "MerchantAgent",
        "http://localhost:8001/a2a/merchant_agent",
        "A sales assistant agent for a merchant.",
      ),
    },
    {
      name: "Credentials Provider Agent",
      port: 8002,
      path: "/a2a/credentials_provider",
      executor: new CredentialsProviderExecutor(),
      card: buildAgentCard(
        "CredentialsProviderAgent",
        "http://localhost:8002/a2a/credentials_provider",
        "Provides mock credential tokens for stored payment methods.",
      ),
    },
    {
      name: "Merchant Payment Processor Agent",
      port: 8003,
      path: "/a2a/merchant_payment_processor_agent",
      executor: new MerchantPaymentProcessorExecutor(),
      card: buildAgentCard(
        "MerchantPaymentProcessorAgent",
        "http://localhost:8003/a2a/merchant_payment_processor_agent",
        "Processes card payments for a merchant.",
      ),
    },
  ];

  const servers = await Promise.all(configs.map(startServer));

  return {
    stopAll: async () => {
      await Promise.all(servers.map(closeServer));
    },
  };
}

if (require.main === module) {
  startAgentServers().catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start agent servers", err);
    process.exit(1);
  });
}
