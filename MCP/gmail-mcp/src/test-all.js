import {
  listEmails,
  readEmail,
  searchEmail,
  getLabels,
} from "./services/gmail.service.js";

const email = "abhiram.binil@nexxbase.com";

console.log("=== EMAILS ===");
const emails = await listEmails(email);
console.log(emails);

console.log("=== LABELS ===");
console.log(await getLabels(email));

const firstId = emails.messages?.[0]?.id;

if (firstId) {
  console.log("=== READ EMAIL ===");
  console.log(await readEmail(email, firstId));
}

console.log("=== SEARCH ===");
console.log(await searchEmail(email, "newer_than:7d"));
