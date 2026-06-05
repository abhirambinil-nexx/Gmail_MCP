import { z } from "zod";
import { readEmail } from "../../services/gmail.service.js";

export default function registerReadEmail(server) {
  server.tool(
    "readEmail",
    {
      email: z.string(),
      messageId: z.string(),
    },
    async ({ email, messageId }) => {
      const data = await readEmail(email, messageId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  );
}
