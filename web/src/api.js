async function tratar(resposta) {
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || 'Erro ao falar com a API');
  return dados;
}

export async function buscar(caminho, parametros = {}) {
  const query = new URLSearchParams();
  Object.entries(parametros).forEach(([chave, valor]) => {
    if (valor !== '' && valor !== undefined && valor !== null) query.set(chave, valor);
  });
  try {
    const resposta = await fetch(`/api/${caminho}?${query}`);
    return tratar(resposta);
  } catch (erro) {
    if (erro instanceof TypeError) throw new Error('Não foi possível conectar à API');
    throw erro;
  }
}

export async function enviar(caminho, metodo, corpo) {
  const resposta = await fetch(`/api/${caminho}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  });
  return tratar(resposta);
}

export const nomesStatus = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
  cancelado: 'Cancelado',
};

export const coresStatus = {
  aberto: 'primary',
  em_andamento: 'warning',
  resolvido: 'info',
  fechado: 'success',
  cancelado: 'secondary',
};

export function dataBr(texto) {
  if (!texto) return '-';
  const [data, hora] = texto.split(' ');
  const [a, m, d] = data.split('-');
  return `${d}/${m}/${a} ${hora.slice(0, 5)}`;
}

export const nomesPrioridade = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };
