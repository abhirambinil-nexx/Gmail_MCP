import { z } from "zod";
import { listEmails } from "../../services/gmail.service.js";

export default function (server) {
  server.tool(
    "listEmails",

    {
      email: z.string(),
    },

    async ({ email }) => {
      const data = await listEmails(email);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data),
          },
        ],
      };
    },
  );
}
