const STATUS = ['aberto', 'em_andamento', 'resolvido', 'fechado', 'cancelado'];
const PRIORIDADES = ['baixa', 'media', 'alta'];

export class ErroApi extends Error {
  constructor(status, mensagem, campos) {
    super(mensagem);
    this.status = status;
    this.campos = campos;
  }
}

function dataValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const data = new Date(texto + 'T00:00:00Z');
  return !isNaN(data) && data.toISOString().startsWith(texto);
}

export function lerFiltros(query) {
  const campos = [];
  const condicoes = [];
  const valores = [];

  if (query.data_inicio) {
    if (dataValida(query.data_inicio)) {
      condicoes.push('date(c.aberto_em) >= ?');
      valores.push(query.data_inicio);
    } else campos.push('data_inicio');
  }
  if (query.data_fim) {
    if (dataValida(query.data_fim)) {
      condicoes.push('date(c.aberto_em) <= ?');
      valores.push(query.data_fim);
    } else campos.push('data_fim');
  }
  if (query.data_inicio && query.data_fim && query.data_inicio > query.data_fim) campos.push('data_inicio');

  if (query.status) {
    if (STATUS.includes(query.status)) {
      condicoes.push('c.status = ?');
      valores.push(query.status);
    } else campos.push('status');
  }
  if (query.prioridade) {
    if (PRIORIDADES.includes(query.prioridade)) {
      condicoes.push('c.prioridade = ?');
      valores.push(query.prioridade);
    } else campos.push('prioridade');
  }
  for (const campo of ['categoria_id', 'tecnico_id', 'unidade_id']) {
    if (query[campo]) {
      const id = Number(query[campo]);
      if (Number.isInteger(id) && id > 0) {
        condicoes.push(`c.${campo} = ?`);
        valores.push(id);
      } else campos.push(campo);
    }
  }
  if (query.busca) {
    condicoes.push('c.titulo LIKE ?');
    valores.push(`%${query.busca}%`);
  }

  if (campos.length) throw new ErroApi(400, 'Filtro inválido', [...new Set(campos)]);
  return { where: condicoes.length ? 'WHERE ' + condicoes.join(' AND ') : '', valores };
}

export { STATUS, PRIORIDADES };
