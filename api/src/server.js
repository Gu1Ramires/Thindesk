import { abrirBanco } from './db.js';
import { criarApp } from './app.js';

const db = abrirBanco(new URL('../dados/thindesk.db', import.meta.url).pathname);
const porta = process.env.PORT || 3333;

criarApp(db).listen(porta, () => console.log(`API rodando em http://localhost:${porta}`));
