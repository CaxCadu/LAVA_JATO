import './App.css'
import './styles/forms.css'
import { VscAccount } from 'react-icons/vsc'
import { GrCar, GrGroup, GrLineChart } from "react-icons/gr"
import { Routes, Route, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Lavadores } from './pages/lavadores'
import { Clientes } from './pages/clientes'
import { Estacionamento } from './pages/estacionamento'
import { Receita } from './pages/receita'
import { Navbar } from './components/Navbar'
import { supabase } from './services/supabaseClient'

type ReceitaDia = {
  dia: string
  total_diario: number
}

function App() {
  const [receitaDia, setReceitaDia] = useState<ReceitaDia[]>([])

  useEffect(() => {
    async function fetchReceita() {
      const { data, error } = await supabase
        .from('receitadia')
        .select('*')

      if (!error && data) {
        setReceitaDia(data)
      }
    }

    fetchReceita()
  }, [])

  return (
    <>
      <Navbar title="Lava Jato" />

      <nav className="pages">
        <Link to="/lavadores"><GrGroup /></Link>
        <Link to="/clientes"><VscAccount /></Link>
        <Link to="/estacionamento"><GrCar /></Link>
        <Link to="/receita"><GrLineChart /></Link>
        <Link to="/lavagem"><GrCar/></Link>
      </nav>

      <Routes>
        <Route path="/lavadores" element={<Lavadores />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/estacionamento" element={<Estacionamento />} />
        <Route path="/receita" element={<Receita />} />

        <Route
          path="/"
          element={
            <>
              <section>
                <h2>Receita diária</h2>
                <div className="receitadiaria">
                  {receitaDia.map(item => (
                    <p key={item.dia}>
                      {item.dia}: R$ {item.total_diario.toFixed(2)}
                    </p>
                  ))}
                </div>
              </section>

              <section className="receitamensal">
                <h2>Receita mensal</h2>
              </section>

              <section className="lucro-liquido">
                <h2>Lucro líquido</h2>
                <p>Despesas</p>
                <p>Receita total</p>
              </section>

              <section className="servicosporlavador">
                <h2>Serviços por lavador</h2>
              </section>
            </>
          }
        />
      </Routes>
    </>
  )
}

export default App
