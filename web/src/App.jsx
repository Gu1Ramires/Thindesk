import { useEffect, useState } from 'react';
import { buscar } from './api.js';
import Filtros from './componentes/Filtros.jsx';
import Indicadores from './componentes/Indicadores.jsx';
import { GraficoPeriodo, GraficoSituacao, GraficoTipos } from './componentes/Graficos.jsx';
import TabelaChamados from './componentes/TabelaChamados.jsx';
import DetalheChamado from './componentes/DetalheChamado.jsx';

function diasAtras(dias) {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return data.toLocaleDateString('sv-SE');
}

const filtrosIniciais = {
  data_inicio: diasAtras(29),
  data_fim: diasAtras(0),
  status: '',
  prioridade: '',
  categoria_id: '',
  tecnico_id: '',
  unidade_id: '',
};

export default function App() {
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [agrupamento, setAgrupamento] = useState('dia');
  const [opcoes, setOpcoes] = useState({ status: [], categorias: [], tecnicos: [], unidades: [] });
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [chamadoAberto, setChamadoAberto] = useState(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    buscar('filtros').then(setOpcoes).catch((e) => setErro(e.message));
  }, []);

  const carregar = async () => {
    try {
      const [indicadores, periodo, situacao, tipos] = await Promise.all([
        buscar('indicadores', filtros),
        buscar('chamados-por-periodo', { ...filtros, agrupamento }),
        buscar('situacao', filtros),
        buscar('tipos', filtros),
      ]);
      setDados({ indicadores, periodo, situacao, tipos });
      setErro('');
      setAtualizadoEm(new Date());
    } catch (e) {
      setErro(e.message);
    }
  };

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, 30000);
    return () => clearInterval(intervalo);
  }, [filtros, agrupamento]);

  const atualizarTudo = () => {
    carregar();
    setVersao(versao + 1);
  };

  return (
    <>
      <nav className="navbar navbar-dark bg-dark px-3">
        <span className="navbar-brand mb-0 h1">Thindesk <small className="text-white-50 fs-6">Painel de chamados</small></span>
        <div className="d-flex align-items-center gap-3">
          {atualizadoEm && <small className="text-white-50">Atualizado às {atualizadoEm.toLocaleTimeString('pt-BR')}</small>}
          <button className="btn btn-outline-light btn-sm" onClick={atualizarTudo}>Atualizar</button>
        </div>
      </nav>

      <main className="container-fluid px-4 py-4">
        <Filtros filtros={filtros} opcoes={opcoes} mudar={setFiltros} limpar={() => setFiltros(filtrosIniciais)} />

        {erro && <div className="alert alert-danger">{erro}</div>}

        {dados && (
          <>
            <Indicadores dados={dados.indicadores} />

            <div className="row g-4 mb-4">
              <div className="col-lg-8">
                <GraficoPeriodo dados={dados.periodo} agrupamento={agrupamento} mudarAgrupamento={setAgrupamento} />
              </div>
              <div className="col-lg-4">
                <GraficoSituacao dados={dados.situacao} />
              </div>
            </div>

            <div className="row g-4">
              <div className="col-lg-4">
                <GraficoTipos dados={dados.tipos} />
              </div>
              <div className="col-lg-8">
                <TabelaChamados filtros={filtros} versao={versao} abrir={setChamadoAberto} />
              </div>
            </div>
          </>
        )}
      </main>

      {chamadoAberto && (
        <DetalheChamado
          id={chamadoAberto}
          tecnicos={opcoes.tecnicos}
          fechar={() => setChamadoAberto(null)}
          aoAlterar={atualizarTudo}
        />
      )}
    </>
  );
}
