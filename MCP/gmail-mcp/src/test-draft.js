import { createDraft } from "./services/gmail.service.js";

const result = await createDraft(
  "abhiram.binil@nexxbase.com",
  "your-other-email@gmail.com",
  "Draft Test",
  "Testing Gmail draft creation",
);

console.log(result);
