import { spawn } from "child_process";
import { startAgentServers } from "./servers";

async function main(): Promise<void> {
  const { stopAll } = await startAgentServers();

  const devtools = spawn("npx", ["@google/adk-devtools", "web", "."], {
    stdio: "inherit",
    shell: true,
  });

  const shutdown = async (code?: number) => {
    await stopAll();
    devtools.kill("SIGTERM");
    process.exit(code ?? 0);
  };

  devtools.on("exit", (code) => {
    void stopAll().then(() => process.exit(code ?? 0));
  });

  process.on("SIGINT", () => {
    shutdown(0).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Failed to shut down cleanly", err);
      process.exit(1);
    });
  });

  process.on("SIGTERM", () => {
    shutdown(0).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Failed to shut down cleanly", err);
      process.exit(1);
    });
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
