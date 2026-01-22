import './App.css'
import './styles/forms.css'

import { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'

import { FaHome } from 'react-icons/fa'
import { VscAccount } from 'react-icons/vsc'
import { GrCar, GrGroup, GrLineChart } from 'react-icons/gr'
import { MdLocalCarWash } from 'react-icons/md'

import { supabase } from './services/supabaseClient'

import { Lavadores } from './pages/lavadores'
import { Clientes } from './pages/clientes'
import { Estacionamento } from './pages/estacionamento'
import { Receita } from './pages/receita'
import { Lavagem } from './pages/lavagem'

/* =======================
   TIPOS (100% alinhados ao banco)
======================= */

type ReceitaResumo = {
  entradas: number
  saidas: number
  lucro: number
}

/* =======================
   COMPONENTE
======================= */

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

  useEffect(() => {
    document.title = 'Lava Jato'

    const fetchData = async () => {
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
    }

    fetchData()
  }, [])

  return (
    <>
      <nav className="pages">
        <Link to="/"><FaHome /></Link>
        <Link to="/lavadores"><GrGroup /></Link>
        <Link to="/clientes"><VscAccount /></Link>
        <Link to="/estacionamento"><GrCar /></Link>
        <Link to="/receita"><GrLineChart /></Link>
        <Link to="/lavagem"><MdLocalCarWash /></Link>
      </nav>

      <Routes>
        <Route path="/lavadores" element={<Lavadores />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/estacionamento" element={<Estacionamento />} />
        <Route path="/receita" element={<Receita />} />
        <Route path="/lavagem" element={<Lavagem />} />

        <Route
          path="/"
          element={
            <div className="dashboard">

              <section className="receitadiaria">
                <h2>Receita do dia</h2>
                <p>Entradas: R$ {receitaDia.entradas.toFixed(2)}</p>
                <p>Saídas: R$ {receitaDia.saidas.toFixed(2)}</p>
                <p>Lucro: R$ {receitaDia.lucro.toFixed(2)}</p>
              </section>

              <section className="receitamensal">
                <h2>Receita mensal</h2>
                <p>Entradas: R$ {receitaMes.entradas.toFixed(2)}</p>
                <p>Saídas: R$ {receitaMes.saidas.toFixed(2)}</p>
                <p>Lucro líquido: R$ {receitaMes.lucro.toFixed(2)}</p>
              </section>

              <section className="lucro-liquido">
                <h2>Resumo</h2>
                <p>Total entradas: R$ {receitaMes.entradas.toFixed(2)}</p>
                <p>Total saídas: R$ {receitaMes.saidas.toFixed(2)}</p>
                <p>Lucro final: R$ {receitaMes.lucro.toFixed(2)}</p>
              </section>

              <section className="servicosporlavador">
                <h2>Serviços por lavador</h2>
                {/* próxima view */}
              </section>

            </div>
          }
        />
      </Routes>
    </>
  )
}

export default App
