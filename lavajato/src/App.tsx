import './App.css'

function App() {

  return (
    <>
      <h1>Lava Jato</h1>

      <div>
        <div className='receitadiaria'>
          <p>Total do dia $</p>

          <p>Lavagens:</p>
          <p>Estacionamento:</p>
        </div>

        <div className='receitamensal'>
          <p>Receita mensal:</p>
        </div>

        <div>
          <p>Serviços pendentes:</p>
        </div>

        <div>
          <p>Lucro líquido:</p>

          <p>Despesas:</p>
          <p>Receita total:</p>
        </div>

        <div>
          <p>Lavadores ativos:</p>
        </div>

        <div>
          <p>Serviços por Lavador:</p>
        </div>
      </div>

      <div className='pages'>
        <a href="">Lavadores</a>
        <a href="">Clientes</a>
        <a href="">Estacionamento</a>
        <a href="">Receitas</a>
      </div>
    </>
  )
}

export default App
