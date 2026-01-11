import '../App.css'
import { VscAccount } from 'react-icons/vsc'
import { GrCar, GrGroup, GrLineChart } from 'react-icons/gr'
import { Routes, Route, Link } from 'react-router-dom'
import { Estacionamento } from './estacionamento'
import { Receita } from './receita'
import { Lavadores } from './lavadores'

export function Clientes() {
  return (
    <Routes>
      <Route path="/lavadores" element={<Lavadores />} />
      <Route path="/estacionamento" element={<Estacionamento />} />
      <Route path="/receita" element={<Receita />} />

      <Route
        path="/"
        element={
          <>
            <div className="page clientes">
              <h1>Clientes</h1>
              <p>Lista de clientes e histórico de atendimentos.</p>
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

            <form action="" method="post">
              <input type="text" placeholder='Nome do cliente'/>
              <input type="number" name="number" id="number" placeholder='Número'/>
              <label for="estado">Escolha seu Estado:</label>
              <select id="estado" name="estado">
                <option value="sp">São Paulo</option>
                <option value="rj">Rio de Janeiro</option>
                <option value="mg">Minas Gerais</option>
              </select>
              <label htmlFor="placa"></label>
              <input type="text" placeholder='Placa do carro'/>
              <label htmlFor="tipodeserviço">Tipo de serviço:</label>
              <select id="tipodeserviço" name="tipodeserviço">
                <option value="lavagem">Lavagem</option>
                <option value="estacionamento">Estacionamento</option>
              </select>
              <button type="submit">Adicionar</button>

            </form>
          </>
        }
      />
    </Routes>
  )
}

export default Clientes
