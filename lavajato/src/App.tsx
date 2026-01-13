import './App.css'
import './styles/forms.css'
import { VscAccount } from 'react-icons/vsc'
import { GrCar, GrGroup, GrLineChart } from "react-icons/gr";
import {Lavadores} from './pages/lavadores';
import { Routes, Route, Link } from 'react-router-dom'
import { Clientes } from './pages/clientes';
import { Estacionamento } from './pages/estacionamento';
import { Receita } from './pages/receita';
import { Navbar } from './components/Navbar';

function App() {
  return (
    <>
      <Navbar title="Lava Jato" />
      <Routes>
        <Route path="/lavadores" element={<Lavadores />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/estacionamento" element={<Estacionamento />} />
        <Route path="/receita" element={<Receita />} />
        <Route path="/" element={
          <>

          <div>
            <div className='receitadiaria'>
              <h2>Total do dia</h2>

              <p>Lavagens:</p>
              <p>Estacionamento </p>
            </div>

            <div className='receitamensal'>
              <h2>Receita mensal</h2>
            </div>

            <div className='pendencias'>
              <h2>Pendências</h2>
            </div>

            <div className='lucro liquido'>
              <h2>Lucro líquido</h2>

              <p>Despesas</p>
              <p>Receita total:</p>
            </div>

            <div className='servicosporlavador'>
              <h2>
                Serviços por lavador</h2>
            </div>
          </div>

          <div className='pages'>
            <Link to="/lavadores"><GrGroup/></Link>
            <Link to="/clientes"><VscAccount /></Link>
            <Link to="/estacionamento"><GrCar /></Link>
            <Link to="/receita"><GrLineChart /></Link>
          </div>
          </>
        } />
      </Routes>
    </>
  )
}

export default App
