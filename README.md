# Área de Membros — Operação 10K IA

App separado da Orvanni Academy. Login simples + dashboard protegido + lista de compradores.

## Rodar local

```bash
npm install
cp .env.example .env
node server.js
```

Abre em `http://localhost:3000`

## Como adicionar um comprador (depois que alguém paga)

```bash
node scripts/add-buyer.js "email@cliente.com" "senha123" "Nome do Cliente"
```

Isso cria (ou atualiza) o acesso em `data/access.json` já com a senha criptografada.
Depois é só mandar o e-mail/senha pro cliente por WhatsApp ou e-mail.

## Onde trocar os links dos módulos

Edita `data/modules.json` e `data/bonus.json` — troca as URLs `SEU-BUCKET-R2.com` pelos
links reais (presigned ou públicos) do seu Cloudflare R2. Não precisa mexer no código.

## Deploy no Render

1. Sobe essa pasta como um repositório novo no GitHub (separado da Academy)
2. No Render: New → Web Service → conecta o repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Em Environment, adiciona `SESSION_SECRET` com um valor aleatório longo
6. Deploy

## Fluxo de venda (fase manual, sem automação)

1. Cliente paga no Stripe/Pagar.me/Cacto
2. Você roda `node scripts/add-buyer.js` no servidor (ou via um pequeno painel depois)
3. Manda o login por WhatsApp/e-mail pro cliente

Quando o volume de vendas justificar, esse passo 2 vira automático via webhook do
Stripe/Pagar.me — aí o próprio pagamento cria o acesso e dispara o e-mail sozinho.

## Estrutura

```
server.js              → toda a lógica (login, sessão, rotas protegidas)
data/access.json        → lista de compradores (e-mail + senha criptografada)
data/modules.json        → os 6 módulos (título, descrição, link do PDF)
data/bonus.json          → link da Biblioteca Operação 10K
scripts/add-buyer.js     → CLI pra adicionar comprador
views/login.ejs          → tela de login
views/dashboard.ejs       → tela principal (Boas-vindas, Módulos, Bônus, Atualizações, Ferramentas)
public/style.css          → identidade visual preto/dourado
```
