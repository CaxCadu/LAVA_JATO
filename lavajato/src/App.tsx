import './App.css'
import './styles/forms.css'
import './styles/saida-modal.css'
import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { FaHome } from 'react-icons/fa'
import { VscAccount } from 'react-icons/vsc'
import { GrCar, GrGroup, GrLineChart } from 'react-icons/gr'
import { MdLocalCarWash } from 'react-icons/md'
import { MdAdd } from 'react-icons/md'
import { supabase } from './services/supabaseClient'
import { Lavadores } from './pages/lavadores'
import { Clientes } from './pages/clientes'
import { Estacionamento } from './pages/estacionamento'
import { Receita } from './pages/receita'
import { Lavagem } from './pages/lavagem'
import { SaidaModal } from './components/SaidaModal'

/* ======================= TIPOS (100% alinhados ao banco) ======================= */
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

/* ======================= COMPONENTE ======================= */
function App() {
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
  const [showSaidaModal, setShowSaidaModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const location = useLocation()

  useEffect(() => {
    document.title = 'Lava Jato'
    
    const fetchData = async () => {
      try {
        /* -------- Receita do dia -------- */
        const { data: dia, error: errDia } = await supabase
          .from('receitadia')
          .select('*')
          .single()

        if (errDia) {
          console.error('Erro receita dia:', errDia)
        } else if (dia) {
          setReceitaDia(dia)
        }

        /* -------- Despesas -------- */
        const { data: saidas, error: errSaidas } = await supabase
          .from('despesas')
          .select('*')
          .order('created_at', { ascending: false })

        if (errSaidas) {
          console.error('Erro despesas:', errSaidas)
        } else if (saidas) {
          setDespesas(saidas)
        }

        /* -------- Receita do mês -------- */
        const { data: mes, error: errMes } = await supabase
          .from('receitames')
          .select('*')
          .single()

        if (errMes) {
          console.error('Erro receita mês:', errMes)
        } else if (mes) {
          setReceitaMes(mes)
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      }
    }

    fetchData()
  }, [refreshKey])

  const handleSaidaRegistered = () => {
    // Recarrega os dados do dashboard
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="app-container">
      {/* Sidebar de Navegação */}
      <aside className="sidebar">
        <div className="logo">
          <h3>Lava-Jato Up</h3>
        </div>
        <nav className="nav-menu">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            title="Dashboard"
          >
            <FaHome />
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/lavadores" 
            className={`nav-link ${location.pathname === '/lavadores' ? 'active' : ''}`}
            title="Lavadores"
          >
            <GrGroup />
            <span>Lavadores</span>
          </Link>
          <Link 
            to="/clientes" 
            className={`nav-link ${location.pathname === '/clientes' ? 'active' : ''}`}
            title="Clientes"
          >
            <VscAccount />
            <span>Clientes</span>
          </Link>
          <Link 
            to="/estacionamento" 
            className={`nav-link ${location.pathname === '/estacionamento' ? 'active' : ''}`}
            title="Estacionamento"
          >
            <GrCar />
            <span>Estacionamento</span>
          </Link>
          <Link 
            to="/receita" 
            className={`nav-link ${location.pathname === '/receita' ? 'active' : ''}`}
            title="Receita"
          >
            <GrLineChart />
            <span>Receita</span>
          </Link>
          <Link 
            to="/lavagem" 
            className={`nav-link ${location.pathname === '/lavagem' ? 'active' : ''}`}
            title="Lavagem"
          >
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
          <Route 
            path="/" 
            element={
              <div className="page-wrapper">
                <header className="page-header">
                  <div className="header-content">
                    <div>
                      <h1>Dashboard</h1>
                      <p className="subtitle">Resumo do negócio</p>
                    </div>
                    <button 
                      className="btn-register-saida" 
                      onClick={() => setShowSaidaModal(true)}
                      title="Registrar saída financeira"
                    >
                      <MdAdd /> Registrar Saída
                    </button>
                  </div>
                </header>

                <div className="dashboard">
                  {/* Linha 1: Receita do Dia e Mês */}
                  <section className="card-container">
                    <div className="card receita-card">
                      <div className="card-header">
                        <h2>Receita do Dia</h2>
                      </div>
                      <div className="card-content">
                        <div className="metric">
                          <span className="metric-label">Entradas</span>
                          <span className="metric-value positivo">
                            R$ {receitaDia.entradas.toFixed(2)}
                          </span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Saídas</span>
                          <span className="metric-value negativo">
                            R$ {receitaDia.saidas.toFixed(2)}
                          </span>
                        </div>
                        <div className="metric total">
                          <span className="metric-label">Lucro</span>
                          <span className="metric-value highlight">
                            R$ {receitaDia.lucro.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="card receita-card">
                      <div className="card-header">
                        <h2>Receita do Mês</h2>
                      </div>
                      <div className="card-content">
                        <div className="metric">
                          <span className="metric-label">Entradas</span>
                          <span className="metric-value positivo">
                            R$ {receitaMes.entradas.toFixed(2)}
                          </span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Saídas</span>
                          <span className="metric-value negativo">
                            R$ {receitaMes.saidas.toFixed(2)}
                          </span>
                        </div>
                        <div className="metric total">
                          <span className="metric-label">Lucro Líquido</span>
                          <span className="metric-value highlight">
                            R$ {receitaMes.lucro.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Linha 2: Resumo Geral */}
                  <section className="card-container full-width">
                    <div className="card summary-card">
                      <div className="card-header">
                        <h2>Resumo Geral</h2>
                      </div>
                      <div className="card-content">
                        <div className="metric">
                          <span className="metric-label">Total de Entradas</span>
                          <span className="metric-value positivo">
                            R$ {receitaMes.entradas.toFixed(2)}
                          </span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Total de Saídas</span>
                          <span className="metric-value negativo">
                            R$ {receitaMes.saidas.toFixed(2)}
                          </span>
                        </div>
                        <div className="metric total">
                          <span className="metric-label">Lucro Final</span>
                          <span className="metric-value highlight">
                            R$ {receitaMes.lucro.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Linha 3: Despesas/Saídas */}
                  <section className="card-container full-width">
                    <div className="card servicosporlavador">
                      <div className="card-header">
                        <h2 style={{ color: '#fff' }}>Saídas Registradas</h2>
                      </div>
                      <div className="card-content">
                        {despesas.length === 0 ? (
                          <p style={{ color: '#fff' }}>Nenhuma saída registrada</p>
                        ) : (
                          <ul className="lista-saidas">
                            {despesas.map((d) => (
                              <li key={d.id} className="saida-item">
                                <span className="saida-descricao">{d.descricao}</span>
                                <span className="saida-valor">
                                  R$ {d.valor.toFixed(2)}
                                </span>
                                <span className="saida-data">
                                  {new Date(d.created_at).toLocaleDateString('pt-BR')}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            }
          />
        </Routes>

        <SaidaModal 
          isOpen={showSaidaModal}
          onClose={() => setShowSaidaModal(false)}
          onSaidaRegistered={handleSaidaRegistered}
        />
      </main>
    </div>
  )
}

export default App