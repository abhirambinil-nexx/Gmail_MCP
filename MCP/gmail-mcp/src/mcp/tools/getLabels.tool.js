import { z } from "zod";
import { getLabels } from "../../services/gmail.service.js";

export default function registerGetLabels(server) {
  server.tool(
    "getLabels",
    {
      email: z.string(),
    },
    async ({ email }) => {
      const data = await getLabels(email);

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
