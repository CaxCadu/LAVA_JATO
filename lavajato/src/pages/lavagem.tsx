import { useEffect, useState } from 'react'
import '../App.css'
import '../styles/forms.css'
import '../styles/lavagem.css'
import { supabase } from '../services/supabaseClient'

interface Lavador {
  id: number
  nome: string
}

interface Lavagem {
  id: number
  nome: string
  lavador_id: number
  categoria: string
  placa: string
  valor: number
  pago: boolean
  created_at: string
  lavadores: {
    nome: string
  }
}

export function Lavagem() {
  const [pago, setPago] = useState(false)
  const [lavadores, setLavadores] = useState<Lavador[]>([])
  const [lavagens, setLavagens] = useState<Lavagem[]>([])
  const [pesquisa, setPesquisa] = useState('')
  const [formData, setFormData] = useState({
    lavador: '',
    categoria: '',
    metodo: '',
    placa: '',
    valor: '',
  })

  const loadData = async () => {
    const { data: lavData, error: lErr } = await supabase.from('lavadores').select('*').order('nome')
    if (lErr) console.error('Erro lavadores:', lErr)
    else setLavadores((lavData as any) || [])

    const { data: lavsData, error: lavsErr } = await supabase
      .from('view_lavagens_dia')
      .select(`
        *,
        lavadores (
          nome
        )
      `)
      .order('created_at', { ascending: false })
    if (lavsErr) console.error('Erro lavagens:', lavsErr)
    else setLavagens((lavsData as any) || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const updatePago = async (id: number, pagoAtual: boolean) => {
    const { error } = await supabase
      .from('lavagens')
      .update({ pago: !pagoAtual })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar pagamento:', error)
      return
    }

    setLavagens(prev =>
      prev.map(l =>
        l.id === id ? { ...l, pago: !pagoAtual } : l
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação corrigida: remover pago da validação pois é um boolean válido
    if (!formData.lavador || !formData.categoria || !formData.placa || !formData.valor) {
      alert('Preencha todos os campos!')
      return
    }

    const { error } = await supabase.from('lavagens').insert({
      lavador_id: Number(formData.lavador),
      categoria: formData.categoria,
      placa: formData.placa,
      valor: Number(formData.valor),
      pago: pago, // Use o estado 'pago' que está no componente
    })

    if (error) {
      console.error('Erro inserir lavagem:', error)
      alert('Erro ao registrar lavagem')
    } else {
      setFormData({ lavador: '', categoria: '', metodo: '', placa: '', valor: '' })
      setPago(false) // Reseta o checkbox também
      loadData()
    }
  }

  const handleDeleteLavagem = async (id: number) => {
    if (!confirm('Remover lavagem?')) return
    const { error } = await supabase.from('lavagens').delete().eq('id', id)
    if (error) console.error('Erro deletar lavagem:', error)
    else setLavagens((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>Lavagem</h1>
        <p className="subtitle">Registre as lavagens realizadas</p>
      </header>

      <main className="page-content">
        <div className="content-container">
          <form onSubmit={handleSubmit} className="form-card">
            <h2>Registrar Nova Lavagem</h2>
            
            <select 
              name="lavador" 
              id="lavador"
              value={formData.lavador} 
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione um lavador</option>
              {lavadores.map((l) => (
                <option key={l.id} value={String(l.id)}>{l.nome}</option>
              ))}
            </select>

            <select 
              name="categoria" 
              id="categoria" 
              value={formData.categoria} 
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione a categoria</option>
              <option value="particular">Particular</option>
              <option value="aplicativo">Aplicativo</option>
              <option value="militar">Militar</option>
              <option value="empresa">Empresa</option>
            </select>

            <input 
              type="text" 
              name="placa" 
              placeholder="Placa do veículo" 
              value={formData.placa} 
              onChange={handleInputChange}
              required
            />

            <input 
              type="number" 
              step="0.01"
              name="valor" 
              placeholder="Valor" 
              value={formData.valor} 
              onChange={handleInputChange}
              required
            />

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={pago}
                onChange={e => setPago(e.target.checked)}
              />
              <span>Já foi pago?</span>
            </label>

            <button type="submit">Registrar Lavagem</button>
          </form>

          <div className="list-section">
            <h2>Serviços Registrados</h2>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Pesquisar lavador..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                className="search-input"
              />
            </div>

            {lavagens.length === 0 ? (
              <p className="empty-message">Nenhuma lavagem registrada.</p>
            ) : (
              <div className="lavadores-columns">
                {lavadores
                  .filter((lavador) =>
                    lavador.nome.toLowerCase().includes(pesquisa.toLowerCase())
                  )
                  .map((lavador) => {
                    const servicosDoLavador = lavagens.filter((lav) => lav.lavador_id === lavador.id)
                    
                    return (
                      <div key={lavador.id} className="lavador-column">
                        <h3 className="lavador-title">{lavador.nome}</h3>
                        <div className="servicos-list">
                          {servicosDoLavador.length === 0 ? (
                            <p className="empty-column">Nenhum serviço</p>
                          ) : (
                            servicosDoLavador.map((servico) => (
                              <div key={servico.id} className="servico-item">
                                <div className="servico-header">
                                  <span className="placa">{servico.placa}</span>
                                  <span className="valor">R$ {servico.valor.toFixed(2)}</span>
                                </div>
                                <div className="servico-footer">
                                  <span className="categoria">{servico.categoria}</span>
                                  <button 
                                    className={`btn-pago ${servico.pago ? 'pago' : 'nao-pago'}`}
                                    onClick={() => updatePago(servico.id, servico.pago)}
                                    title={servico.pago ? 'Marcar como não pago' : 'Marcar como pago'}
                                  >
                                    {servico.pago ? '✓ Pago' : '✕ Não pago'}
                                  </button>
                                  <button 
                                    className="btn-delete-small" 
                                    onClick={() => handleDeleteLavagem(servico.id)}
                                    title="Remover serviço"
                                  >
                                    ✕
                                  </button>
                                </div>
                                <div className="servico-datetime">
                                  {new Date(servico.created_at).toLocaleString('pt-BR')}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Lavagem