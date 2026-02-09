import { useEffect, useState } from 'react'
import '../App.css'
import '../styles/forms.css'
import { supabase } from '../services/supabaseClient'

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

interface Estacionamento {
  id: number
  categoria: string
  placa: string
  valor: number
  pagamento: string
  pago: boolean
  created_at: string
}

export function Pendentes() {
  const [lavagens, setLavagens] = useState<Lavagem[]>([])
  const [estacionamentos, setEstacionamentos] = useState<Estacionamento[]>([])
  const [abas, setAbas] = useState<'todos' | 'lavagens' | 'estacionamentos'>('todos')

  const loadData = async () => {
    // Busca lavagens com pagamento pendente
    const { data: lavsData, error: lavsErr } = await supabase
      .from('view_lavagens_dia')
      .select(`
        *,
        lavadores (
          nome
        )
      `)
      .eq('pago', false)
      .order('created_at', { ascending: false })
    
    if (lavsErr) console.error('Erro ao buscar lavagens pendentes:', lavsErr)
    else setLavagens((lavsData as any) || [])

    // Busca estacionamentos com pagamento pendente
    const { data: estData, error: estErr } = await supabase
      .from('view_estacionamentos_dia')
      .select('*')
      .eq('pago', false)
      .order('created_at', { ascending: false })

    if (estErr) console.error('Erro ao buscar estacionamentos pendentes:', estErr)
    else setEstacionamentos(estData || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  const updatePagoLavagem = async (id: number) => {
    const { error } = await supabase
      .from('lavagens')
      .update({ pago: true })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar pagamento:', error)
      return
    }

    setLavagens(prev => prev.filter(l => l.id !== id))
  }

  const updatePagoEstacionamento = async (id: number) => {
    const { error } = await supabase
      .from('estacionamento')
      .update({ pago: true })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar pagamento:', error)
      return
    }

    setEstacionamentos(prev => prev.filter(e => e.id !== id))
  }

  const handleDeleteLavagem = async (id: number) => {
    if (!confirm('Remover lavagem?')) return
    const { error } = await supabase.from('lavagens').delete().eq('id', id)
    if (error) console.error('Erro deletar lavagem:', error)
    else setLavagens(prev => prev.filter(l => l.id !== id))
  }

  const handleDeleteEstacionamento = async (id: number) => {
    if (!confirm('Remover estacionamento?')) return
    const { error } = await supabase.from('estacionamento').delete().eq('id', id)
    if (error) console.error('Erro deletar estacionamento:', error)
    else setEstacionamentos(prev => prev.filter(e => e.id !== id))
  }

  const totalLavagens = lavagens.length
  const totalEstacionamentos = estacionamentos.length
  const totalPendente = totalLavagens + totalEstacionamentos

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>Pagamentos Pendentes</h1>
        <p className="subtitle">Acompanhe lavagens e estacionamentos não pagos</p>
      </header>

      <main className="page-content">
        <div className="content-container">
          {/* Resumo */}
          <div className="resumo-cards" style={{ marginBottom: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#999' }}>Total Pendente</h3>
              <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#ff6b6b' }}>R$ {(lavagens.reduce((sum, l) => sum + l.valor, 0) + estacionamentos.reduce((sum, e) => sum + e.valor, 0)).toFixed(2)}</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>{totalPendente} item{totalPendente !== 1 ? 's' : ''}</p>
            </div>
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#999' }}>Lavagens</h3>
              <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#012fff' }}>{totalLavagens}</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>R$ {lavagens.reduce((sum, l) => sum + l.valor, 0).toFixed(2)}</p>
            </div>
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#999' }}>Estacionamentos</h3>
              <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#764ba2' }}>{totalEstacionamentos}</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>R$ {estacionamentos.reduce((sum, e) => sum + e.valor, 0).toFixed(2)}</p>
            </div>
          </div>

          {/* Abas */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', borderBottom: '2px solid #e0e0e0' }}>
            <button
              onClick={() => setAbas('todos')}
              style={{
                padding: '12px 20px',
                background: abas === 'todos' ? '#012fff' : 'transparent',
                color: abas === 'todos' ? 'white' : '#666',
                border: 'none',
                borderBottom: abas === 'todos' ? '2px solid #012fff' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
            >
              Todos ({totalPendente})
            </button>
            <button
              onClick={() => setAbas('lavagens')}
              style={{
                padding: '12px 20px',
                background: abas === 'lavagens' ? '#012fff' : 'transparent',
                color: abas === 'lavagens' ? 'white' : '#666',
                border: 'none',
                borderBottom: abas === 'lavagens' ? '2px solid #012fff' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
            >
              Lavagens ({totalLavagens})
            </button>
            <button
              onClick={() => setAbas('estacionamentos')}
              style={{
                padding: '12px 20px',
                background: abas === 'estacionamentos' ? '#012fff' : 'transparent',
                color: abas === 'estacionamentos' ? 'white' : '#666',
                border: 'none',
                borderBottom: abas === 'estacionamentos' ? '2px solid #012fff' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
            >
              Estacionamentos ({totalEstacionamentos})
            </button>
          </div>

          <div className="list-section">
            {/* TODOS */}
            {abas === 'todos' && (
              <>
                {totalPendente === 0 ? (
                  <p className="empty-message">Não há pagamentos pendentes! 🎉</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* Lavagens */}
                    {totalLavagens > 0 && (
                      <div>
                        <h3 style={{ marginBottom: '15px', color: '#012fff' }}>Lavagens Pendentes</h3>
                        <div style={{ display: 'grid', gap: '10px' }}>
                          {lavagens.map(lavagem => (
                            <div
                              key={lavagem.id}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto',
                                gap: '15px',
                                alignItems: 'center',
                                background: 'white',
                                border: '1px solid #e0e0e0',
                                padding: '15px',
                                borderRadius: '8px',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
                              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                            >
                              <div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '8px' }}>
                                  <div>
                                    <span style={{ fontSize: '12px', color: '#999' }}>Placa</span>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold' }}>{lavagem.placa}</p>
                                  </div>
                                  <div>
                                    <span style={{ fontSize: '12px', color: '#999' }}>Valor</span>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: '#ff6b6b' }}>R$ {lavagem.valor.toFixed(2)}</p>
                                  </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '8px' }}>
                                  <div>
                                    <span style={{ fontSize: '12px', color: '#999' }}>Lavador</span>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{lavagem.lavadores?.nome || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span style={{ fontSize: '12px', color: '#999' }}>Categoria</span>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{lavagem.categoria}</p>
                                  </div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#999' }}>
                                  {new Date(lavagem.created_at).toLocaleString('pt-BR')}
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <button
                                  onClick={() => updatePagoLavagem(lavagem.id)}
                                  style={{
                                    padding: '8px 16px',
                                    background: '#4caf50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    transition: 'background 0.2s',
                                    whiteSpace: 'nowrap'
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = '#45a049')}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = '#4caf50')}
                                >
                                  ✓ Marcar Pago
                                </button>
                                <button
                                  onClick={() => handleDeleteLavagem(lavagem.id)}
                                  style={{
                                    padding: '8px 16px',
                                    background: '#ff6b6b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    transition: 'background 0.2s',
                                    whiteSpace: 'nowrap'
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = '#ff5252')}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = '#ff6b6b')}
                                >
                                  ✕ Apagar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Estacionamentos */}
                    {totalEstacionamentos > 0 && (
                      <div>
                        <h3 style={{ marginBottom: '15px', color: '#764ba2' }}>Estacionamentos Pendentes</h3>
                        <div style={{ display: 'grid', gap: '10px' }}>
                          {estacionamentos.map(estac => (
                            <div
                              key={estac.id}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto',
                                gap: '15px',
                                alignItems: 'center',
                                background: 'white',
                                border: '1px solid #e0e0e0',
                                padding: '15px',
                                borderRadius: '8px',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
                              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                            >
                              <div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '8px' }}>
                                  <div>
                                    <span style={{ fontSize: '12px', color: '#999' }}>Placa</span>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold' }}>{estac.placa}</p>
                                  </div>
                                  <div>
                                    <span style={{ fontSize: '12px', color: '#999' }}>Valor</span>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: '#ff6b6b' }}>R$ {estac.valor.toFixed(2)}</p>
                                  </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '8px' }}>
                                  <div>
                                    <span style={{ fontSize: '12px', color: '#999' }}>Categoria</span>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{estac.categoria}</p>
                                  </div>
                                  <div>
                                    <span style={{ fontSize: '12px', color: '#999' }}>Pagamento</span>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{estac.pagamento === 'sim' ? 'Máquina/PIX' : 'Dinheiro'}</p>
                                  </div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#999' }}>
                                  {new Date(estac.created_at).toLocaleString('pt-BR')}
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <button
                                  onClick={() => updatePagoEstacionamento(estac.id)}
                                  style={{
                                    padding: '8px 16px',
                                    background: '#4caf50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    transition: 'background 0.2s',
                                    whiteSpace: 'nowrap'
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = '#45a049')}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = '#4caf50')}
                                >
                                  ✓ Marcar Pago
                                </button>
                                <button
                                  onClick={() => handleDeleteEstacionamento(estac.id)}
                                  style={{
                                    padding: '8px 16px',
                                    background: '#ff6b6b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    transition: 'background 0.2s',
                                    whiteSpace: 'nowrap'
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = '#ff5252')}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = '#ff6b6b')}
                                >
                                  ✕ Apagar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* APENAS LAVAGENS */}
            {abas === 'lavagens' && (
              <>
                {totalLavagens === 0 ? (
                  <p className="empty-message">Nenhuma lavagem pendente</p>
                ) : (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {lavagens.map(lavagem => (
                      <div
                        key={lavagem.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: '15px',
                          alignItems: 'center',
                          background: 'white',
                          border: '1px solid #e0e0e0',
                          padding: '15px',
                          borderRadius: '8px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                      >
                        <div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '8px' }}>
                            <div>
                              <span style={{ fontSize: '12px', color: '#999' }}>Placa</span>
                              <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold' }}>{lavagem.placa}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: '12px', color: '#999' }}>Valor</span>
                              <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: '#ff6b6b' }}>R$ {lavagem.valor.toFixed(2)}</p>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '8px' }}>
                            <div>
                              <span style={{ fontSize: '12px', color: '#999' }}>Lavador</span>
                              <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{lavagem.lavadores?.nome || 'N/A'}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: '12px', color: '#999' }}>Categoria</span>
                              <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{lavagem.categoria}</p>
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {new Date(lavagem.created_at).toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            onClick={() => updatePagoLavagem(lavagem.id)}
                            style={{
                              padding: '8px 16px',
                              background: '#4caf50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              transition: 'background 0.2s',
                              whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#45a049')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#4caf50')}
                          >
                            ✓ Marcar Pago
                          </button>
                          <button
                            onClick={() => handleDeleteLavagem(lavagem.id)}
                            style={{
                              padding: '8px 16px',
                              background: '#ff6b6b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              transition: 'background 0.2s',
                              whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#ff5252')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#ff6b6b')}
                          >
                            ✕ Apagar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* APENAS ESTACIONAMENTOS */}
            {abas === 'estacionamentos' && (
              <>
                {totalEstacionamentos === 0 ? (
                  <p className="empty-message">Nenhum estacionamento pendente</p>
                ) : (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {estacionamentos.map(estac => (
                      <div
                        key={estac.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: '15px',
                          alignItems: 'center',
                          background: 'white',
                          border: '1px solid #e0e0e0',
                          padding: '15px',
                          borderRadius: '8px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                      >
                        <div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '8px' }}>
                            <div>
                              <span style={{ fontSize: '12px', color: '#999' }}>Placa</span>
                              <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold' }}>{estac.placa}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: '12px', color: '#999' }}>Valor</span>
                              <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: '#ff6b6b' }}>R$ {estac.valor.toFixed(2)}</p>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '8px' }}>
                            <div>
                              <span style={{ fontSize: '12px', color: '#999' }}>Categoria</span>
                              <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{estac.categoria}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: '12px', color: '#999' }}>Pagamento</span>
                              <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{estac.pagamento === 'sim' ? 'Máquina/PIX' : 'Dinheiro'}</p>
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {new Date(estac.created_at).toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            onClick={() => updatePagoEstacionamento(estac.id)}
                            style={{
                              padding: '8px 16px',
                              background: '#4caf50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              transition: 'background 0.2s',
                              whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#45a049')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#4caf50')}
                          >
                            ✓ Marcar Pago
                          </button>
                          <button
                            onClick={() => handleDeleteEstacionamento(estac.id)}
                            style={{
                              padding: '8px 16px',
                              background: '#ff6b6b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              transition: 'background 0.2s',
                              whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#ff5252')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#ff6b6b')}
                          >
                            ✕ Apagar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Pendentes
