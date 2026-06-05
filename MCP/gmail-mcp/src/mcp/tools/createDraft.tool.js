import { z } from "zod";
import { createDraft } from "../../services/gmail.service.js";

export default function registerCreateDraft(server) {
  server.tool(
    "createDraft",
    {
      email: z.string(),
      to: z.string(),
      subject: z.string(),
      body: z.string(),
    },
    async ({ email, to, subject, body }) => {
      const data = await createDraft(email, to, subject, body);

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
