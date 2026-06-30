import { z } from "zod";
import { searchEmail } from "../../services/gmail.service.js";

export default function registerSearchEmail(server) {
  server.tool(
    "searchEmail",
    {
      email: z.string(),
      query: z.string(),
    },
    async ({ email, query }) => {
      const data = await searchEmail(email, query);

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
