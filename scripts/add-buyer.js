// Uso: node scripts/add-buyer.js "email@cliente.com" "senha123" "Nome do Cliente"
// Isso adiciona (ou atualiza) um comprador em data/access.json com a senha já criptografada.

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const ACCESS_FILE = path.join(__dirname, "..", "data", "access.json");

async function main() {
  const [, , email, password, ...nameParts] = process.argv;
  const name = nameParts.join(" ") || email;

  if (!email || !password) {
    console.log("Uso: node scripts/add-buyer.js \"email@cliente.com\" \"senha123\" \"Nome do Cliente\"");
    process.exit(1);
  }

  const raw = fs.readFileSync(ACCESS_FILE, "utf-8");
  const buyers = JSON.parse(raw);

  const passwordHash = await bcrypt.hash(password, 10);
  const emailLower = email.trim().toLowerCase();

  const existingIndex = buyers.findIndex(b => b.email === emailLower);
  const record = { email: emailLower, passwordHash, name, addedAt: new Date().toISOString() };

  if (existingIndex >= 0) {
    buyers[existingIndex] = record;
    console.log(`Comprador atualizado: ${emailLower}`);
  } else {
    buyers.push(record);
    console.log(`Comprador adicionado: ${emailLower}`);
  }

  fs.writeFileSync(ACCESS_FILE, JSON.stringify(buyers, null, 2));
}

main();
