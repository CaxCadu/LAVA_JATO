import './App.css'
import './styles/forms.css'
import { VscAccount } from 'react-icons/vsc'
import { GrCar, GrGroup, GrLineChart } from "react-icons/gr"
import { FaHome } from "react-icons/fa";
import { Routes, Route, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Lavadores } from './pages/lavadores'
import { Clientes } from './pages/clientes'
import { Estacionamento } from './pages/estacionamento'
import { Receita } from './pages/receita'
import { MdLocalCarWash } from "react-icons/md";
import { supabase } from './services/supabaseClient'
import { Lavagem } from './pages/lavagem'

type ReceitaDiaItem = {
  id: string
  valor: string
  created_at: string
  origem?: string
  data: number
}

type Receitas = {
  total: number
  saidas: number
  lucro: number
}


function App() {
  const [receitaDia, setReceitaDia] = useState<ReceitaDiaItem[]>([])  
  const [receitas, setReceitas] = useState<Receitas>({
    total: 0,
    saidas: 0,
    lucro: 0
})


  useEffect(() => {
  async function fetchReceitaDia() {
    const { data, error } = await supabase
      .from('receitadia')
      .select('valor')

    if (!error && data) {
      setReceitaDia(data)
    }
  }

  async function fetchReceitas() {
    const { data, error } = await supabase
      .from('receitas')
      .select('*')
      .single()

    if (!error && data) {
      setReceitas(data)
    }
  }

  fetchReceitaDia()
  fetchReceitas()
}, [])



  return (
    <>
      <title>Lava Jato</title>

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
                {receitaDia.map((item) => (
                  <p key={item.id}>R$ {parseFloat(item.valor).toFixed(2)}</p>
                ))}
              </section>


              <section className="receitamensal">
                <h2>Receita mensal</h2>
                <p>R$ {receitas.total.toFixed(2)}</p>
                <p>Despesas mensais</p>
                <p>R$ {receitas.saidas.toFixed(2)}</p>
                <p>Lucro líquido mensal</p>
                <p>R$ {receitas.lucro.toFixed(2)}</p>
              </section>

              <section className="lucro-liquido">
                <h2>Lucro líquido</h2>
                <p>Despesas</p>
                <p>Receita total</p>
              </section>

              <section className="servicosporlavador">
                <h2>Serviços por lavador</h2>
              </section>
            </div>
          }
        />
      </Routes>
    </>
  )
}

export default App
