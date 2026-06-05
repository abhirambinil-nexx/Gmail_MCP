import { z } from "zod";
import { sendEmail } from "../../services/gmail.service.js";

export default function registerSendEmail(server) {
  server.tool(
    "sendEmail",
    {
      email: z.string(),
      to: z.string(),
      subject: z.string(),
      body: z.string(),
    },
    async ({ email, to, subject, body }) => {
      const data = await sendEmail(email, to, subject, body);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data.data, null, 2),
          },
        ],
      };
    },
  );
}
