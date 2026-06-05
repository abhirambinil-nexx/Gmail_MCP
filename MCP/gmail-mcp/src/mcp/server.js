import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerTools } from "./tools.js";

const server = new McpServer({
  name: "gmail-mcp",
  version: "1.0.0",
});

console.log("Starting MCP...");

registerTools(server);

console.log("Tools Registered");
const transport = new StdioServerTransport();

await server.connect(transport);
export default server;
