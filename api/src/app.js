import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { rotasDashboard } from './rotas/dashboard.js';
import { rotasChamados } from './rotas/chamados.js';
import { ErroApi } from './filtros.js';

export function criarApp(db) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api', rotasDashboard(db));
  app.use('/api/chamados', rotasChamados(db));

  app.use('/api', (req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
  });

  const site = new URL('../../web/dist', import.meta.url).pathname;
  if (existsSync(site)) {
    app.use(express.static(site));
    app.get(/.*/, (req, res) => res.sendFile(site + '/index.html'));
  }

  app.use((erro, req, res, next) => {
    if (erro.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido' });
    if (erro instanceof ErroApi) return res.status(erro.status).json({ erro: erro.message, campos: erro.campos });
    console.error(erro);
    res.status(500).json({ erro: 'Erro interno' });
  });

  return app;
}
