import http from "http";
import { loadEnv } from "./common/env";
import { MerchantAgentExecutor } from "./roles/merchant_agent/agentExecutor";
import { MerchantPaymentProcessorExecutor } from "./roles/merchant_payment_processor_agent/agentExecutor";
import { CredentialsProviderExecutor } from "./roles/credentials_provider_agent/agentExecutor";
import type { BaseServerExecutor } from "./common/baseServerExecutor";
import type { Message, Part, Task } from "./common/a2aTypes";
import { InMemoryTaskUpdater } from "./common/simpleTaskUpdater";
import { PAYMENT_MANDATE_DATA_KEY, PAYMENT_RECEIPT_DATA_KEY } from "./ap2/types/constants";

interface AgentCard {
  name: string;
  description: string;
  url: string;
  preferredTransport: string;
  protocolVersion: string;
  version: string;
  defaultInputModes?: string[];
  defaultOutputModes?: string[];
  capabilities: {
    extensions: Array<{ uri: string; description: string; required: boolean }>;
  };
  skills?: Array<Record<string, unknown>>;
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
const SAMPLE_CARD_EXTENSION_URI = "https://sample-card-network.github.io/paymentmethod/types/v1";

function buildAgentCard(name: string, url: string, description: string): AgentCard {
  return {
    name,
    description,
    url,
    preferredTransport: "JSONRPC",
    protocolVersion: "0.3.0",
    version: "1.0.0",
    defaultInputModes: ["json"],
    defaultOutputModes: ["json"],
    capabilities: {
      extensions: [
        {
          uri: PAYMENT_EXTENSION_URI,
          description: "Supports the Agent Payments Protocol.",
          required: true,
        },
        {
          uri: SAMPLE_CARD_EXTENSION_URI,
          description: "Supports the Sample Card Network payment method extension",
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

    const isAgentCardRequest =
      req.method === "GET" &&
      (req.url === "/.well-known/agent-card.json" ||
        req.url === `${config.path}/.well-known/agent-card.json` ||
        req.url === "/.well-known/agent.json" ||
        req.url === "/agent.json");

    if (isAgentCardRequest) {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(config.card, null, 2));
      return;
    }

    if (req.method === "POST" && req.url.startsWith(config.path)) {
      const rawBody = await readBody(req);
      try {
        const payload = rawBody ? JSON.parse(rawBody) : {};
        const { message, currentTask, isRpc, id } = normalizePayload(payload);
        if (!message) {
          throw new Error("Missing message in request body");
        }

        const updater = new InMemoryTaskUpdater(message.context_id);
        try {
          await config.executor.execute({ message }, updater, currentTask);
          const task = updater.toTask(currentTask?.id);
          res.writeHead(200, { "content-type": "application/json" });
          if (isRpc) {
            res.end(JSON.stringify({ id, jsonrpc: "2.0", result: { task } }, null, 2));
          } else {
            res.end(JSON.stringify({ task }, null, 2));
          }
        } catch (err) {
          const error = err instanceof Error ? err.message : String(err);
          res.writeHead(500, { "content-type": "application/json" });
          if (isRpc) {
            res.end(JSON.stringify({ id, jsonrpc: "2.0", error }));
          } else {
            res.end(JSON.stringify({ error }));
          }
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

function normalizePayload(payload: any): { message?: Message; currentTask?: Task; isRpc?: boolean; id?: string } {
  if (!payload) return {};

  // JSON-RPC shape coming from the Python demo.
  if (payload.jsonrpc && payload.params) {
    const rpcMessage = payload.params.message as any;
    const rpcTask = payload.params.current_task ?? payload.params.task;
    return {
      isRpc: true,
      id: payload.id as string | undefined,
      message: rpcMessage ? normalizeRpcMessage(rpcMessage) : undefined,
      currentTask: rpcTask,
    };
  }

  return {
    message: payload.message as Message | undefined,
    currentTask: (payload.current_task ?? payload.task) as Task | undefined,
  };
}

function normalizeRpcMessage(rpcMessage: any): Message {
  const parts: Part[] = (rpcMessage.parts ?? []).map((part: any) => {
    if (part.kind === "text" && part.text) {
      return { text_part: { text: String(part.text) } };
    }

    if (part.kind === "data" && part.data) {
      const [rawKey, value] = Object.entries(part.data)[0];
      const key = mapDataKey(rawKey);
      return { data_part: { key, data: value } };
    }

    return part as Part;
  });

  return {
    id: rpcMessage.messageId ?? rpcMessage.id ?? "rpc-message",
    role: rpcMessage.role ?? "agent",
    context_id: rpcMessage.contextId ?? rpcMessage.context_id,
    parts,
  };
}

function mapDataKey(key: string): string {
  if (key === "ap2.mandates.PaymentMandate") return PAYMENT_MANDATE_DATA_KEY;
  if (key === "ap2.PaymentReceipt") return PAYMENT_RECEIPT_DATA_KEY;
  return key;
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
      card: {
        ...buildAgentCard(
          "MerchantAgent",
          "http://localhost:8001/a2a/merchant_agent",
          "A sales assistant agent for a merchant.",
        ),
        skills: [
          {
            id: "search_catalog",
            name: "Search Catalog",
            description:
              "Searches the merchant's catalog based on a shopping intent & returns a cart containing the top results.",
            tags: ["merchant", "search", "catalog"],
          },
        ],
      },
    },
    {
      name: "Credentials Provider Agent",
      port: 8002,
      path: "/a2a/credentials_provider",
      executor: new CredentialsProviderExecutor(),
      card: {
        ...buildAgentCard(
          "CredentialsProvider",
          "http://localhost:8002/a2a/credentials_provider",
          "An agent that holds a user's payment credentials.",
        ),
        defaultInputModes: ["text/plain"],
        defaultOutputModes: ["application/json"],
        skills: [
          {
            id: "initiate_payment",
            name: "Initiate Payment",
            description: "Initiates a payment with the correct payment processor.",
            tags: ["payments"],
          },
          {
            id: "get_eligible_payment_methods",
            name: "Get Eligible Payment Methods",
            description: "Provides a list of eligible payment methods for a particular purchase.",
            tags: ["eligible", "payment", "methods"],
          },
          {
            id: "get_account_shipping_address",
            name: "Get Shipping Address",
            description: "Fetches the shipping address from a user's wallet.",
            tags: ["account", "shipping"],
          },
        ],
      },
    },
    {
      name: "Merchant Payment Processor Agent",
      port: 8003,
      path: "/a2a/merchant_payment_processor_agent",
      executor: new MerchantPaymentProcessorExecutor(),
      card: {
        ...buildAgentCard(
          "merchant_payment_processor_agent",
          "http://localhost:8003/a2a/merchant_payment_processor_agent",
          "An agent that processes card payments on behalf of a merchant.",
        ),
        defaultInputModes: ["text/plain"],
        defaultOutputModes: ["application/json"],
        skills: [
          {
            id: "card-processor",
            name: "Card Processor",
            description: "Processes card payments.",
            tags: ["payment", "card"],
          },
        ],
      },
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
