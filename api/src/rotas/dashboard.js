import { Router } from 'express';
import { lerFiltros, ErroApi, STATUS } from '../filtros.js';
import { agora } from '../db.js';

const nomesStatus = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
  cancelado: 'Cancelado',
};

export function rotasDashboard(db) {
  const rotas = Router();

  rotas.get('/indicadores', (req, res) => {
    const { where, valores } = lerFiltros(req.query);
    const r = db.prepare(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(status IN ('aberto', 'em_andamento')), 0) AS em_aberto,
        COALESCE(SUM(status IN ('resolvido', 'fechado')), 0) AS atendidos,
        COALESCE(SUM(status = 'cancelado'), 0) AS cancelados,
        COALESCE(SUM(status IN ('aberto', 'em_andamento') AND prazo_em < ?), 0) AS atrasados,
        COALESCE(SUM(resolvido_em <= prazo_em), 0) AS no_prazo,
        AVG((julianday(resolvido_em) - julianday(aberto_em)) * 24) AS tempo_medio
      FROM chamados c ${where}
    `).get(agora(), ...valores);

    res.json({
      total: r.total,
      em_aberto: r.em_aberto,
      atendidos: r.atendidos,
      cancelados: r.cancelados,
      atrasados: r.atrasados,
      sla_percentual: r.atendidos ? Math.round((r.no_prazo / r.atendidos) * 1000) / 10 : null,
      tempo_medio_horas: r.tempo_medio === null ? null : Math.round(r.tempo_medio * 10) / 10,
    });
  });

  rotas.get('/chamados-por-periodo', (req, res) => {
    const agrupamento = req.query.agrupamento || 'dia';
    if (!['dia', 'mes'].includes(agrupamento)) throw new ErroApi(400, 'Agrupamento deve ser dia ou mes', ['agrupamento']);
    const formato = agrupamento === 'dia' ? '%Y-%m-%d' : '%Y-%m';
    const { where, valores } = lerFiltros(req.query);

    const abertos = db.prepare(`SELECT strftime('${formato}', aberto_em) AS periodo, COUNT(*) AS total FROM chamados c ${where} GROUP BY periodo`).all(...valores);
    const atendidos = db.prepare(`SELECT strftime('${formato}', resolvido_em) AS periodo, COUNT(*) AS total FROM chamados c ${where ? where + ' AND' : 'WHERE'} resolvido_em IS NOT NULL GROUP BY periodo`).all(...valores);

    const periodos = [...new Set([...abertos, ...atendidos].map((l) => l.periodo))].sort();
    res.json(periodos.map((periodo) => ({
      periodo,
      abertos: abertos.find((l) => l.periodo === periodo)?.total || 0,
      atendidos: atendidos.find((l) => l.periodo === periodo)?.total || 0,
    })));
  });

  rotas.get('/situacao', (req, res) => {
    const { where, valores } = lerFiltros(req.query);
    const linhas = db.prepare(`SELECT status, COUNT(*) AS total FROM chamados c ${where} GROUP BY status`).all(...valores);
    res.json(STATUS.map((status) => ({
      status,
      nome: nomesStatus[status],
      total: linhas.find((l) => l.status === status)?.total || 0,
    })));
  });

  rotas.get('/tipos', (req, res) => {
    const { where, valores } = lerFiltros(req.query);
    res.json(db.prepare(`
      SELECT cat.nome AS tipo, COUNT(*) AS total, COALESCE(SUM(c.status IN ('resolvido', 'fechado')), 0) AS atendidos
      FROM chamados c JOIN categorias cat ON cat.id = c.categoria_id
      ${where}
      GROUP BY cat.id
      ORDER BY atendidos DESC
    `).all(...valores));
  });

  rotas.get('/filtros', (req, res) => {
    res.json({
      categorias: db.prepare('SELECT id, nome FROM categorias ORDER BY nome').all(),
      tecnicos: db.prepare('SELECT id, nome FROM tecnicos ORDER BY nome').all(),
      unidades: db.prepare('SELECT id, nome FROM unidades ORDER BY nome').all(),
      status: STATUS.map((s) => ({ id: s, nome: nomesStatus[s] })),
    });
  });

  return rotas;
}
