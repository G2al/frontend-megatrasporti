/* eslint-disable @typescript-eslint/no-require-imports -- eseguito direttamente da Node, non da un bundler */
const { createServer } = require("http");
const next = require("next");

const port = Number(process.env.PORT) || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Mega Trasporti in ascolto sulla porta ${port}`);
  });
});
