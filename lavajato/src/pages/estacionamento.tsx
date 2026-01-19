import '../App.css'
import '../styles/forms.css'

export function Estacionamento() {
  return (
    <>
      <h1>Estacionamento</h1>

      <div>
        <form>
          <label>Registrar novo estacionamento</label>

          <select name="categoria" id="categoria">
            <option value="">Selecione a categoria</option>
            <option value="particular">Particular</option>
            <option value="aplicativo">Aplicativo</option>
            <option value="militar">Militar</option>
          </select>

          <input
            type="text"
            name="placa"
            placeholder="Placa do veículo"
          />

          <input
            type="number"
            name="tempo"
            id="tempo"
            placeholder="Valor"
          />

          <button type="submit">
            Registrar Estacionamento
          </button>
        </form>
      </div>

      <div className="services-section">
        <label>Serviços registrados:</label>
      </div>
    </>
  )
}

export default Estacionamento
