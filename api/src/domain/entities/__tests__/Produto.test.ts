import { describe, it, expect } from 'bun:test'
import { Produto } from '../Produto.ts'

describe('Produto', () => {
  const props = {
    id: '1',
    tenantId: 't1',
    nome: 'Dipirona 500mg',
    codigoBarras: '7891234567890',
    categoria: 'Analgésicos',
    laboratorio: null,
    precoVenda: 8.5,
    precoCusto: 4.0,
    unidade: 'UN',
    estoqueAtual: 10,
    estoqueMinimo: 5,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('deve expor todas as propriedades via getters', () => {
    const produto = new Produto(props)

    expect(produto.id).toBe('1')
    expect(produto.tenantId).toBe('t1')
    expect(produto.nome).toBe('Dipirona 500mg')
    expect(produto.codigoBarras).toBe('7891234567890')
    expect(produto.categoria).toBe('Analgésicos')
    expect(produto.precoVenda).toBe(8.5)
    expect(produto.precoCusto).toBe(4.0)
    expect(produto.unidade).toBe('UN')
    expect(produto.estoqueAtual).toBe(10)
    expect(produto.estoqueMinimo).toBe(5)
    expect(produto.ativo).toBe(true)
  })

  it('deve indicar estoque baixo quando igual ao mínimo', () => {
    const produto = new Produto({ ...props, estoqueAtual: 5 })
    expect(produto.estoqueBaixo).toBe(true)
  })

  it('deve indicar estoque baixo quando abaixo do mínimo', () => {
    const produto = new Produto({ ...props, estoqueAtual: 2 })
    expect(produto.estoqueBaixo).toBe(true)
  })

  it('não deve indicar estoque baixo quando acima do mínimo', () => {
    const produto = new Produto({ ...props, estoqueAtual: 10 })
    expect(produto.estoqueBaixo).toBe(false)
  })
})
