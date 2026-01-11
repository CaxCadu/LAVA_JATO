import '../App.css'
import { VscAccount } from 'react-icons/vsc'
import { GrCar, GrGroup, GrLineChart } from 'react-icons/gr'
import { Routes, Route, Link } from 'react-router-dom'
import { Clientes } from './clientes'
import { Estacionamento } from './estacionamento'
import { Receita } from './receita'

export function Lavadores() {
  return (
    <Routes>
      <Route path="/lavadores" element={<Lavadores />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/estacionamento" element={<Estacionamento />} />
      <Route path="/receita" element={<Receita />} />

      <Route
        path="/"
        element={
          <>
            <div className="page lavadores">
              <h1>Lavadores</h1>
            </div>

            <div className="pages">
              <Link to="/lavadores">
                <GrGroup />
              </Link>

              <Link to="/clientes">
                <VscAccount />
              </Link>

              <Link to="/estacionamento">
                <GrCar />
              </Link>

              <Link to="/receita">
                <GrLineChart />
              </Link>
            </div>

            <div>
              <form action="" method="post">
                <input type="text" placeholder='Adicione Lavadores'/>
                <button type="submit">Adicionar</button>
              </form>
            </div>

            <div>
              <p>Lista de lavadores e estatísticas rápidas.</p>
            </div>

            <div>
              <h2>Lista de Lavadores</h2>
            </div>
          </>
        }
      />
    </Routes>
    

  )
}

export default Lavadores
