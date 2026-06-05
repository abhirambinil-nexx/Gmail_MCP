import { listEmails } from "./services/gmail.service.js";

const emails = await listEmails("abhiram.binil@nexxbase.com");

console.log(JSON.stringify(emails, null, 2));
