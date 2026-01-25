import './App.css'
import './styles/forms.css'
import './styles/saida-modal.css'
import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { FaHome } from 'react-icons/fa'
import { VscAccount } from 'react-icons/vsc'
import { GrCar, GrGroup, GrLineChart } from 'react-icons/gr'
import { MdLocalCarWash, MdAdd } from 'react-icons/md'
import { supabase } from './services/supabaseClient'
import { Lavadores } from './pages/lavadores'
import { Clientes } from './pages/clientes'
import { Estacionamento } from './pages/estacionamento'
import { Receita } from './pages/receita'
import { Lavagem } from './pages/lavagem'
import { SaidaModal } from './components/SaidaModal'
import { FechamentoModal } from './components/FechamentoModal'

/* ==================== TIPOS ==================== */
type ReceitaResumo = {
  entradas: number
  saidas: number
  lucro: number
}

type Despesa = {
  id: string
  descricao: string
  valor: number
  created_at: string
}

type ServicoResumo = {
  quantidade: number
  valor: number
}

/* ==================== COMPONENTE PRINCIPAL ==================== */
function App() {
  // Estados de Receita
  const [receitaDia, setReceitaDia] = useState<ReceitaResumo>({
    entradas: 0,
    saidas: 0,
    lucro: 0
  })
  const [receitaMes, setReceitaMes] = useState<ReceitaResumo>({
    entradas: 0,
    saidas: 0,
    lucro: 0
  })

  // Estados de Serviços
  const [lavagensDia, setLavagensDia] = useState<ServicoResumo>({ quantidade: 0, valor: 0 })
  const [estacionamentoDia, setEstacionamentoDia] = useState<ServicoResumo>({ quantidade: 0, valor: 0 })

  // Estados de UI
  const [showSaidaModal, setShowSaidaModal] = useState(false)
  const [showFechamentoModal, setShowFechamentoModal] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSelecionada, setDataSelecionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [refreshKey, setRefreshKey] = useState(0)
  const location = useLocation()

  /* ==================== FUNÇÕES AUXILIARES ==================== */
  
  const formatarData = (data: Date) => {
    data.setHours(0, 0, 0, 0)
    return data
  }

  const obterIntervaloDias = () => {
    const dataSelecion = new Date(dataSelecionada)
    const diaInicio = formatarData(new Date(dataSelecion))
    const diaFim = new Date(dataSelecion)
    diaFim.setHours(23, 59, 59, 999)

    return { diaInicio, diaFim }
  }

  const obterIntervaloMes = () => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    firstDay.setHours(0, 0, 0, 0)
    lastDay.setHours(23, 59, 59, 999)

    return { firstDay, lastDay }
  }

  /* ==================== FETCH DE DADOS ==================== */

  const buscarLavagensNoDia = async (diaInicio: Date, diaFim: Date) => {
    const { data, error } = await supabase
      .from('lavagens')
      .select('valor')
      .gte('created_at', diaInicio.toISOString())
      .lte('created_at', diaFim.toISOString())

    if (error) {
      console.error('Erro lavagens dia:', error)
      return { quantidade: 0, valor: 0 }
    }

    const quantidade = data?.length || 0
    const valor = data?.reduce((sum, l) => sum + (l.valor || 0), 0) || 0
    return { quantidade, valor }
  }

  const buscarEstacionamentoNoDia = async (diaInicio: Date, diaFim: Date) => {
    const { data, error } = await supabase
      .from('estacionamento')
      .select('valor')
      .gte('created_at', diaInicio.toISOString())
      .lte('created_at', diaFim.toISOString())

    if (error) {
      console.error('Erro estacionamento dia:', error)
      return { quantidade: 0, valor: 0 }
    }

    const quantidade = data?.length || 0
    const valor = data?.reduce((sum, e) => sum + (e.valor || 0), 0) || 0
    return { quantidade, valor }
  }

  const buscarDespesasNoDia = async (diaInicio: Date, diaFim: Date) => {
    const { data, error } = await supabase
      .from('despesas')
      .select('valor')
      .gte('created_at', diaInicio.toISOString())
      .lte('created_at', diaFim.toISOString())

    if (error) {
      console.error('Erro despesas dia:', error)
      return 0
    }

    return data?.reduce((sum, d) => sum + (d.valor || 0), 0) || 0
  }

  const buscarReceitaMes = async () => {
    const { firstDay, lastDay } = obterIntervaloMes()
    
    const { data: lavagens, error: errLavagens } = await supabase
      .from('lavagens')
      .select('valor')
      .gte('created_at', firstDay.toISOString())
      .lte('created_at', lastDay.toISOString())

    const { data: estacionamento, error: errEst } = await supabase
      .from('estacionamento')
      .select('valor')
      .gte('created_at', firstDay.toISOString())
      .lte('created_at', lastDay.toISOString())

    const { data: despesas, error: errDesp } = await supabase
      .from('despesas')
      .select('valor')
      .gte('created_at', firstDay.toISOString())
      .lte('created_at', lastDay.toISOString())

    if (errLavagens || errEst || errDesp) {
      console.error('Erro ao buscar receita do mês')
      return { entradas: 0, saidas: 0, lucro: 0 }
    }

    const entradas = (lavagens?.reduce((sum, l) => sum + (l.valor || 0), 0) || 0) +
                    (estacionamento?.reduce((sum, e) => sum + (e.valor || 0), 0) || 0)
    const saidas = despesas?.reduce((sum, d) => sum + (d.valor || 0), 0) || 0
    const lucro = entradas - saidas

    return { entradas, saidas, lucro }
  }

  /* ==================== EFEITO PRINCIPAL ==================== */

  useEffect(() => {
    document.title = 'Lava Jato'

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const { diaInicio, diaFim } = obterIntervaloDias()

        // Buscar dados do dia selecionado
        const [lavagens, estacionamento, receita_mes, despesas_valor] = await Promise.all([
          buscarLavagensNoDia(diaInicio, diaFim),
          buscarEstacionamentoNoDia(diaInicio, diaFim),
          buscarReceitaMes(),
          buscarDespesasNoDia(diaInicio, diaFim)
        ])

        setLavagensDia(lavagens)
        setEstacionamentoDia(estacionamento)

        // Calcular receita do dia com despesas do dia
        const totalEntradas = lavagens.valor + estacionamento.valor
        setReceitaDia({
          entradas: totalEntradas,
          saidas: despesas_valor,
          lucro: totalEntradas - despesas_valor
        })

        // Definir dados do mês
        setReceitaMes(receita_mes)
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
        setError('Erro ao carregar dados. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [refreshKey, dataSelecionada])

  const handleSaidaRegistered = () => {
    setRefreshKey(prev => prev + 1)
  }

  /* ==================== RENDER ==================== */

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <h3>Lava-Jato Up</h3>
        </div>
        <nav className="nav-menu">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} title="Dashboard">
            <FaHome />
            <span>Dashboard</span>
          </Link>
          <Link to="/lavadores" className={`nav-link ${location.pathname === '/lavadores' ? 'active' : ''}`} title="Lavadores">
            <GrGroup />
            <span>Lavadores</span>
          </Link>
          <Link to="/clientes" className={`nav-link ${location.pathname === '/clientes' ? 'active' : ''}`} title="Clientes">
            <VscAccount />
            <span>Clientes</span>
          </Link>
          <Link to="/estacionamento" className={`nav-link ${location.pathname === '/estacionamento' ? 'active' : ''}`} title="Estacionamento">
            <GrCar />
            <span>Estacionamento</span>
          </Link>
          <Link to="/receita" className={`nav-link ${location.pathname === '/receita' ? 'active' : ''}`} title="Receita">
            <GrLineChart />
            <span>Receita</span>
          </Link>
          <Link to="/lavagem" className={`nav-link ${location.pathname === '/lavagem' ? 'active' : ''}`} title="Lavagem">
            <MdLocalCarWash />
            <span>Lavagem</span>
          </Link>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="main-content">
        <Routes>
          <Route path="/lavadores" element={<Lavadores />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/estacionamento" element={<Estacionamento />} />
          <Route path="/receita" element={<Receita />} />
          <Route path="/lavagem" element={<Lavagem />} />
          <Route path="/" element={<DashboardPage />} />
        </Routes>

        <SaidaModal 
          isOpen={showSaidaModal}
          onClose={() => setShowSaidaModal(false)}
          onSaidaRegistered={handleSaidaRegistered}
        />
        <FechamentoModal
          isOpen={showFechamentoModal}
          onClose={() => setShowFechamentoModal(false)}
          valorTotalDia={receitaDia.lucro}
        />
      </main>
    </div>
  )

  /* ==================== COMPONENTE DASHBOARD ==================== */

  function DashboardPage() {
    return (
      <div className="page-wrapper">
        <header className="page-header">
          <div className="header-content">
            <div>
              <h1>Dashboard</h1>
              <p className="subtitle">Resumo do negócio</p>
            </div>
            <div className="header-buttons">
              <input 
                type="date" 
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                className="filter-date"
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              />
              <button 
                className="btn-register-saida" 
                onClick={() => setShowFechamentoModal(true)}
                title="Fazer fechamento do dia"
              >
                <MdAdd /> Fazer Fechamento
              </button>
              <button 
                className="btn-register-saida" 
                onClick={() => setShowSaidaModal(true)}
                title="Registrar saída financeira"
              >
                <MdAdd /> Registrar Saída
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="loading-spinner">
            <p>Carregando dados...</p>
          </div>
        ) : (
          <div className="dashboard">
            {/* Receita */}
            <section className="card-container">
              <CardReceita titulo="Receita do Dia" receita={receitaDia} />
              <CardReceita titulo="Receita do Mês" receita={receitaMes} />
            </section>

            {/* Serviços do Dia */}
            <section className="card-container">
              <CardServico titulo="Lavagens - Dia" servico={lavagensDia} />
              <CardServico titulo="Estacionamento - Dia" servico={estacionamentoDia} />
            </section>

            {/* Resumo Geral */}
            <section className="card-container full-width">
              <div className="card summary-card">
                <div className="card-header">
                  <h2>Resumo Geral</h2>
                </div>
                <div className="card-content">
                  <div className="metric">
                    <span className="metric-label">Total de Entradas</span>
                    <span className="metric-value positivo">R$ {receitaMes.entradas.toFixed(2)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Total de Saídas</span>
                    <span className="metric-value negativo">R$ {receitaMes.saidas.toFixed(2)}</span>
                  </div>
                  <div className="metric total">
                    <span className="metric-label">Lucro Final</span>
                    <span className="metric-value highlight">R$ {receitaMes.lucro.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </section>


          </div>
        )}
      </div>
    )
  }
}

/* ==================== COMPONENTES REUTILIZÁVEIS ==================== */

function CardReceita({ titulo, receita }: { titulo: string; receita: ReceitaResumo }) {
  return (
    <div className="card receita-card">
      <div className="card-header">
        <h2>{titulo}</h2>
      </div>
      <div className="card-content">
        <div className="metric">
          <span className="metric-label">Entradas</span>
          <span className="metric-value positivo">R$ {receita.entradas.toFixed(2)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Saídas</span>
          <span className="metric-value negativo">R$ {receita.saidas.toFixed(2)}</span>
        </div>
        <div className="metric total">
          <span className="metric-label">{titulo.includes('Mês') ? 'Lucro Líquido' : 'Lucro'}</span>
          <span className="metric-value highlight">R$ {receita.lucro.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

function CardServico({ titulo, servico }: { titulo: string; servico: ServicoResumo }) {
  return (
    <div className="card receita-card">
      <div className="card-header">
        <h2>{titulo}</h2>
      </div>
      <div className="card-content">
        <div className="metric">
          <span className="metric-label">Quantidade</span>
          <span className="metric-value positivo">{servico.quantidade}</span>
        </div>
        <div className="metric total">
          <span className="metric-label">Valor</span>
          <span className="metric-value highlight">R$ {servico.valor.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default App