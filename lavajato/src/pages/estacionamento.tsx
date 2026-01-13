import '../App.css'
import '../styles/forms.css'
import { VscAccount } from 'react-icons/vsc'
import { GrCar, GrGroup, GrLineChart } from 'react-icons/gr'
import { Routes, Route, Link } from 'react-router-dom'
import { Clientes } from './clientes'
import { Receita } from './receita'
import { Lavadores } from './lavadores'
import { Navbar } from '../components/Navbar'

export function Estacionamento() {
  return (
    <>
      <Navbar title="Estacionamento" />
      <Routes>
        <Route path="/lavadores" element={<Lavadores />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/receita" element={<Receita />} />

        <Route
          path="/"
          element={
            <>
              

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
            </>
          }
        />
      </Routes>
    </>
  )
}

export default Estacionamento

