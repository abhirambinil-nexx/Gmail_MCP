import { z } from "zod";

import {
  listEmails,
  readEmail,
  searchEmail,
} from "../services/gmail.service.js";
import registerListEmails from "./tools/listEmails.tool.js";
import registerReadEmail from "./tools/readEmail.tool.js";
import registerSearchEmail from "./tools/searchEmail.tool.js";
import registerSendEmail from "./tools/sendEmail.tool.js";
import registerCreateDraft from "./tools/createDraft.tool.js";
import registerGetLabels from "./tools/getLabels.tool.js";

export function registerTools(server) {
  registerListEmails(server);

  registerReadEmail(server);

  registerSearchEmail(server);

  registerSendEmail(server);

  registerCreateDraft(server);

  registerGetLabels(server);
}
