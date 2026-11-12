const numero = (valor) => valor.toLocaleString('pt-BR');

export default function Indicadores({ dados }) {
  if (!dados) return null;

  const itens = [
    { nome: 'Total de chamados', valor: dados.total },
    { nome: 'Em aberto', valor: dados.em_aberto },
    { nome: 'Atendidos', valor: dados.atendidos },
    { nome: 'Dentro do prazo', valor: dados.sla_percentual === null ? '-' : `${numero(dados.sla_percentual)}%` },
    { nome: 'Tempo médio de solução', valor: dados.tempo_medio_horas === null ? '-' : `${numero(dados.tempo_medio_horas)} h` },
    { nome: 'Atrasados em aberto', valor: dados.atrasados, alerta: dados.atrasados > 0 },
  ];

  return (
    <div className="row g-3 mb-4">
      {itens.map((item) => (
        <div key={item.nome} className="col-6 col-md-4 col-xl-2">
          <div className={`indicador ${item.alerta ? 'alerta' : ''}`}>
            <div className="text-muted small">{item.nome}</div>
            <div className="fs-3 fw-semibold">{item.valor}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
