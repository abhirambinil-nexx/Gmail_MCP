import { sendEmail } from "./services/gmail.service.js";

await sendEmail(
  "abhiram.binil@nexxbase.com",
  "YOUR_OTHER_EMAIL@gmail.com",
  "Gmail MCP Test",
  "Hello from Gmail MCP",
);

console.log("Email sent successfully");
