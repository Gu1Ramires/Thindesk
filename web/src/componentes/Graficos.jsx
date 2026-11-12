import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);
ChartJS.defaults.animation = false;

const cores = {
  aberto: '#0d6efd',
  em_andamento: '#fd7e14',
  resolvido: '#20c997',
  fechado: '#198754',
  cancelado: '#6c757d',
};

function rotulo(periodo) {
  const partes = periodo.split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}` : `${partes[1]}/${partes[0]}`;
}

export function GraficoPeriodo({ dados, agrupamento, mudarAgrupamento }) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center titulo-secao">
        <span>Chamados abertos e atendidos por período</span>
        <div className="btn-group btn-group-sm">
          <button className={`btn btn-outline-primary ${agrupamento === 'dia' ? 'active' : ''}`} onClick={() => mudarAgrupamento('dia')}>Dia</button>
          <button className={`btn btn-outline-primary ${agrupamento === 'mes' ? 'active' : ''}`} onClick={() => mudarAgrupamento('mes')}>Mês</button>
        </div>
      </div>
      <div style={{ height: 280 }}>
        <Line
          data={{
            labels: dados.map((p) => rotulo(p.periodo)),
            datasets: [
              { label: 'Abertos', data: dados.map((p) => p.abertos), borderColor: '#0d6efd', backgroundColor: '#0d6efd', tension: 0.2 },
              { label: 'Atendidos', data: dados.map((p) => p.atendidos), borderColor: '#198754', backgroundColor: '#198754', tension: 0.2 },
            ],
          }}
          options={{ maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, scales: { y: { beginAtZero: true } } }}
        />
      </div>
    </div>
  );
}

export function GraficoSituacao({ dados }) {
  return (
    <div>
      <div className="titulo-secao">Situação dos chamados</div>
      <div style={{ height: 280 }}>
        <Bar
          data={{
            labels: dados.map((s) => s.nome),
            datasets: [{ label: 'Chamados', data: dados.map((s) => s.total), backgroundColor: dados.map((s) => cores[s.status]) }],
          }}
          options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
        />
      </div>
    </div>
  );
}

export function GraficoTipos({ dados }) {
  return (
    <div>
      <div className="titulo-secao">Tipos de chamados mais atendidos</div>
      <div style={{ height: 260 }}>
        <Bar
          data={{
            labels: dados.map((t) => t.tipo),
            datasets: [{ label: 'Atendidos', data: dados.map((t) => t.atendidos), backgroundColor: '#0d6efd' }],
          }}
          options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } } }}
        />
      </div>
    </div>
  );
}
