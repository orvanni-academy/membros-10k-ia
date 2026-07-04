require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const ACCESS_FILE = path.join(__dirname, "data", "access.json");
const MODULES_FILE = path.join(__dirname, "data", "modules.json");
const BONUS_FILE = path.join(__dirname, "data", "bonus.json");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET || "troque-esse-segredo-no-.env",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 dias
    httpOnly: true
  }
}));

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect("/login");
}

// ---------- ROTAS ----------

app.get("/", (req, res) => {
  res.redirect(req.session.user ? "/dashboard" : "/login");
});

app.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  res.render("login", { erro: req.query.erro });
});

app.post("/login", async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const senha = req.body.senha || "";

  const buyers = readJSON(ACCESS_FILE);
  const buyer = buyers.find(b => b.email === email);

  if (!buyer) {
    return res.redirect("/login?erro=1");
  }

  const senhaOk = await bcrypt.compare(senha, buyer.passwordHash);
  if (!senhaOk) {
    return res.redirect("/login?erro=1");
  }

  req.session.user = { email: buyer.email, name: buyer.name };
  res.redirect("/dashboard");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

app.get("/dashboard", requireAuth, (req, res) => {
  const modules = readJSON(MODULES_FILE);
  res.render("dashboard", { user: req.session.user, modules });
});

// Rota intermediária de download — garante que só quem tá logado acessa o link real
app.get("/download/:id", requireAuth, (req, res) => {
  const modules = readJSON(MODULES_FILE);
  const bonus = readJSON(BONUS_FILE);
  const items = [...modules, bonus];
  const item = items.find(m => m.id === req.params.id);
  if (!item) return res.status(404).send("Item não encontrado.");
  res.redirect(item.url);
});

app.listen(PORT, () => {
  console.log(`Área de membros rodando em http://localhost:${PORT}`);
});
