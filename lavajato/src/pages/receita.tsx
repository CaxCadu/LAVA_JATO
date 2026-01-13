import '../App.css'
import '../styles/forms.css'
import { VscAccount } from 'react-icons/vsc'
import { GrCar, GrGroup, GrLineChart } from 'react-icons/gr'
import { Routes, Route, Link } from 'react-router-dom'
import { Clientes } from './clientes'
import { Estacionamento } from './estacionamento'
import { Lavadores } from './lavadores'
import { Navbar } from '../components/Navbar'

export function Receita() {
  return (
    <>
      <Navbar title="Receita" />
      <Routes>
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/estacionamento" element={<Estacionamento />} />
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

export default Receita
