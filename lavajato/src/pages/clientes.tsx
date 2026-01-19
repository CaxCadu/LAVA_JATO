import { useEffect, useState } from 'react'
import '../App.css'
import '../styles/forms.css'
import { supabase } from '../services/supabaseClient'

interface Cliente {
  id: number
  nome: string
  telefone: string
}

interface Lavador {
  id: number
  nome: string
}

interface Servico {
  id: number
  nome: string
  preco_base: number
}

export function Clientes() {
  const [showForm, setShowForm] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [lavadores, setLavadores] = useState<Lavador[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    lavador_id: '',
    placa: '',
    servico_id: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const loadInitialData = async () => {
    const { data: clientsData, error: cErr } = await supabase.from('clientes').select('*').order('id', { ascending: false })
    if (cErr) console.error('Erro clientes:', cErr)
    else setClientes((clientsData as any) || [])

    const { data: lavData, error: lErr } = await supabase.from('lavadores').select('*').order('nome')
    if (lErr) console.error('Erro lavadores:', lErr)
    else setLavadores((lavData as any) || [])

    const { data: sData, error: sErr } = await supabase.from('servicos').select('*').order('nome')
    if (sErr) console.error('Erro servicos:', sErr)
    else setServicos((sData as any) || [])
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  const handleAddCliente = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.telefone || !formData.lavador_id || !formData.placa || !formData.servico_id) {
      alert('Por favor, preencha todos os campos!')
      return
    }

    // Insere cliente
    const { data: clienteCreated, error: insertCliErr } = await supabase
      .from('clientes')
      .insert({ nome: formData.nome, telefone: formData.telefone })
      .select('id, nome, telefone')
      .single()

    if (insertCliErr) {
      console.error('Erro ao inserir cliente:', insertCliErr)
      alert('Erro ao cadastrar cliente')
      return
    }

    const clienteId = (clienteCreated as any).id

    // Insere veículo
    const { data: veiculoCreated, error: veicErr } = await supabase
      .from('veiculos')
      .insert({ cliente_id: clienteId, placa: formData.placa })
      .select('id')
      .single()

    if (veicErr) console.error('Erro ao inserir veículo:', veicErr)

    const veiculoId = veiculoCreated ? (veiculoCreated as any).id : null

    // Cria atendimento
    const preco = servicos.find((s) => String(s.id) === formData.servico_id)?.preco_base ?? 0
    const { error: atErr } = await supabase.from('atendimentos').insert({
      codigo: `AT-${Date.now()}`,
      cliente_id: clienteId,
      veiculo_id: veiculoId,
      servico_id: Number(formData.servico_id),
      lavador_id: Number(formData.lavador_id),
      status: 'pendente',
      preco_total: preco,
    })

    if (atErr) console.error('Erro ao criar atendimento:', atErr)

    // Recarrega lista
    await loadInitialData()

    setFormData({ nome: '', telefone: '', lavador_id: '', placa: '', servico_id: '' })
    setShowForm(false)
  }

  const handleDeleteCliente = async (id: number) => {
    if (!confirm('Remover cliente e todos os dados relacionados?')) return
    const { error } = await supabase.from('clientes').delete().eq('id', id)
    if (error) console.error('Erro remover cliente:', error)
    else setClientes((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <>
      <h1>Clientes</h1>

      {/* Seção da Lista de Clientes */}
      <div className="clientes-container">
        <h2>Lista de Clientes</h2>

        {/* Botão Adicionar Cliente */}
        {!showForm && (
          <div className="btn-container">
            <button
              className="btn-add"
              onClick={() => setShowForm(true)}
            >
              + Adicionar Cliente
            </button>
          </div>
        )}

        {clientes.length === 0 ? (
          <p className="empty-message">Nenhum cliente cadastrado.</p>
        ) : (
          <div className="clientes-list">
            {clientes.map((cliente) => (
              <div key={cliente.id} className="cliente-card">
                <div className="cliente-info">
                  <h3>{cliente.nome}</h3>
                  <p>
                    <strong>Telefone:</strong> {cliente.telefone}
                  </p>
                </div>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteCliente(cliente.id)}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulário - Renderizado Condicionalmente */}
      {showForm && (
        <form onSubmit={handleAddCliente}>
          <label htmlFor="nome">Nome do Cliente:</label>
          <input
            id="nome"
            type="text"
            placeholder="Digite o nome do cliente"
            value={formData.nome}
            onChange={handleInputChange}
          />

          <label htmlFor="telefone">Telefone:</label>
          <input
            id="tel"
            type="tel"
            placeholder="Digite o número"
            value={formData.telefone}
            onChange={handleInputChange}
          />

          <label htmlFor="lavador_id">Escolha o Lavador:</label>
          <select id="lavador_id" value={formData.lavador_id} onChange={handleInputChange}>
            <option value="">Selecione um lavador</option>
            {lavadores.map((l) => (
              <option key={l.id} value={String(l.id)}>{l.nome}</option>
            ))}
          </select>

          <label htmlFor="placa">Placa do Carro:</label>
          <input
            id="placa"
            type="text"
            placeholder="Ex: ABC1234"
            value={formData.placa}
            onChange={handleInputChange}
          />

          <label htmlFor="servico_id">Tipo de Serviço:</label>
          <select id="servico_id" value={formData.servico_id} onChange={handleInputChange}>
            <option value="">Selecione um serviço</option>
            {servicos.map((s) => (
              <option key={s.id} value={String(s.id)}>{s.nome} — R$ {s.preco_base}</option>
            ))}
          </select>

          <div className="form-buttons">
            <button type="submit">Adicionar Cliente</button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </>
  )
}

export default Clientes
