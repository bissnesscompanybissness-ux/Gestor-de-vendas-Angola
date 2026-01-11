// src/utils/saftAO.ts

// ===== Types =====
export interface Empresa {
  nome: string
  nif: string
  endereco?: string
  municipio?: string
  provincia?: string
  telefone?: string
  email?: string
  softwareNome?: string
  softwareVersao?: string
}

export interface Imposto {
  codigo: string        // e.g., IVA
  descricao: string     // e.g., Imposto sobre o Valor Acrescentado
  taxa: number          // e.g., 14
}

export interface Cliente {
  id: string
  nome: string
  nif?: string
  endereco?: string
  municipio?: string
  provincia?: string
  telefone?: string
  email?: string
}

export interface Produto {
  id: string
  nome: string
  codigo?: string
  precoUnitario: number
  unidade?: string      // e.g., UN, KG
  impostoCodigo?: string
}

export interface LinhaFatura {
  produtoId: string
  descricao?: string
  quantidade: number
  precoUnitario: number
  impostoCodigo?: string
  desconto?: number     // valor monetário
}

export interface Fatura {
  numero: string
  data: string          // YYYY-MM-DD
  clienteId: string
  linhas: LinhaFatura[]
  moeda?: string        // e.g., AOA
  observacoes?: string
}

// ===== Helpers =====
const esc = (v?: string | number) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const fmt = (n: number) => n.toFixed(2)

function calcularTotaisFatura(linhas: LinhaFatura[], impostos: Imposto[]) {
  let totalSemImposto = 0
  let totalImposto = 0

  const mapaImpostos = new Map<string, number>() // codigo -> total imposto

  for (const l of linhas) {
    const base = l.quantidade * l.precoUnitario - (l.desconto ?? 0)
    totalSemImposto += base

    const imp = impostos.find(i => i.codigo === l.impostoCodigo)
    const valorImp = imp ? (base * imp.taxa) / 100 : 0
    totalImposto += valorImp

    if (imp) {
      mapaImpostos.set(imp.codigo, (mapaImpostos.get(imp.codigo) ?? 0) + valorImp)
    }
  }

  const total = totalSemImposto + totalImposto
  return { totalSemImposto, totalImposto, total, mapaImpostos }
}

// ===== Main generator =====
export function gerarSaftAO(
  empresa: Empresa,
  clientes: Cliente[],
  produtos: Produto[],
  impostos: Imposto[],
  faturas: Fatura[]
): string {
  const nowISO = new Date().toISOString()

  const headerXML = `
    <Header>
      <CompanyName>${esc(empresa.nome)}</CompanyName>
      <TaxID>${esc(empresa.nif)}</TaxID>
      <Address>${esc(empresa.endereco)}</Address>
      <Municipality>${esc(empresa.municipio)}</Municipality>
      <Province>${esc(empresa.provincia)}</Province>
      <Telephone>${esc(empresa.telefone)}</Telephone>
      <Email>${esc(empresa.email)}</Email>
      <SoftwareName>${esc(empresa.softwareNome ?? 'Gestor de Vendas Angola')}</SoftwareName>
      <SoftwareVersion>${esc(empresa.softwareVersao ?? '1.0')}</SoftwareVersion>
      <FileDate>${esc(nowISO)}</FileDate>
    </Header>
  `.trim()

  const masterFilesXML = `
    <MasterFiles>
      <Customers>
        ${clientes.map(c => `
          <Customer>
            <CustomerID>${esc(c.id)}</CustomerID>
            <CustomerName>${esc(c.nome)}</CustomerName>
            <TaxID>${esc(c.nif)}</TaxID>
            <Address>${esc(c.endereco)}</Address>
            <Municipality>${esc(c.municipio)}</Municipality>
            <Province>${esc(c.provincia)}</Province>
            <Telephone>${esc(c.telefone)}</Telephone>
            <Email>${esc(c.email)}</Email>
          </Customer>
        `.trim()).join('')}
      </Customers>
      <Products>
        ${produtos.map(p => `
          <Product>
            <ProductID>${esc(p.id)}</ProductID>
            <ProductCode>${esc(p.codigo)}</ProductCode>
            <ProductDescription>${esc(p.nome)}</ProductDescription>
            <UnitPrice>${fmt(p.precoUnitario)}</UnitPrice>
            <UnitOfMeasure>${esc(p.unidade ?? 'UN')}</UnitOfMeasure>
            <TaxCode>${esc(p.impostoCodigo ?? '')}</TaxCode>
          </Product>
        `.trim()).join('')}
      </Products>
      <Taxes>
        ${impostos.map(t => `
          <Tax>
            <TaxCode>${esc(t.codigo)}</TaxCode>
            <TaxDescription>${esc(t.descricao)}</TaxDescription>
            <TaxPercentage>${fmt(t.taxa)}</TaxPercentage>
          </Tax>
        `.trim()).join('')}
      </Taxes>
    </MasterFiles>
  `.trim()

  const invoicesXML = `
    <SourceDocuments>
      <SalesInvoices>
        ${faturas.map(f => {
          const cliente = clientes.find(c => c.id === f.clienteId)
          const { totalSemImposto, totalImposto, total, mapaImpostos } = calcularTotaisFatura(f.linhas, impostos)

          const linhasXML = f.linhas.map(l => {
            const prod = produtos.find(p => p.id === l.produtoId)
            const base = l.quantidade * l.precoUnitario - (l.desconto ?? 0)
            const imp = impostos.find(i => i.codigo === (l.impostoCodigo ?? prod?.impostoCodigo))
            const valorImp = imp ? (base * imp.taxa) / 100 : 0

            return `
              <Line>
                <ProductCode>${esc(prod?.codigo ?? prod?.id ?? '')}</ProductCode>
                <ProductDescription>${esc(l.descricao ?? prod?.nome ?? '')}</ProductDescription>
                <Quantity>${fmt(l.quantidade)}</Quantity>
                <UnitPrice>${fmt(l.precoUnitario)}</UnitPrice>
                <Discount>${fmt(l.desconto ?? 0)}</Discount>
                <TaxCode>${esc(imp?.codigo ?? '')}</TaxCode>
                <TaxPercentage>${fmt(imp?.taxa ?? 0)}</TaxPercentage>
                <TaxAmount>${fmt(valorImp)}</TaxAmount>
                <LineTotal>${fmt(base + valorImp)}</LineTotal>
              </Line>
            `.trim()
          }).join('')

          const impostosXML = Array.from(mapaImpostos.entries()).map(([codigo, valor]) => {
            const imp = impostos.find(i => i.codigo === codigo)
            return `
              <TaxSummary>
                <TaxCode>${esc(codigo)}</TaxCode>
                <TaxPercentage>${fmt(imp?.taxa ?? 0)}</TaxPercentage>
                <TaxAmount>${fmt(valor)}</TaxAmount>
              </TaxSummary>
            `.trim()
          }).join('')

          return `
            <Invoice>
              <InvoiceNo>${esc(f.numero)}</InvoiceNo>
              <InvoiceDate>${esc(f.data)}</InvoiceDate>
              <Currency>${esc(f.moeda ?? 'AOA')}</Currency>
              <CustomerID>${esc(cliente?.id ?? '')}</CustomerID>
              <CustomerName>${esc(cliente?.nome ?? '')}</CustomerName>
              <Lines>${linhasXML}</Lines>
              <Totals>
                <NetTotal>${fmt(totalSemImposto)}</NetTotal>
                <TaxTotal>${fmt(totalImposto)}</TaxTotal>
                <GrossTotal>${fmt(total)}</GrossTotal>
              </Totals>
              <Taxes>${impostosXML}</Taxes>
              <Notes>${esc(f.observacoes)}</Notes>
            </Invoice>
          `.trim()
        }).join('')}
      </SalesInvoices>
    </SourceDocuments>
  `.trim()

  const xml = `
    <?xml version="1.0" encoding="UTF-8"?>
    <SAFTAO>
      ${headerXML}
      ${masterFilesXML}
      ${invoicesXML}
    </SAFTAO>
  `.trim()

  return xml
}

// ===== Optional: browser download helper =====
export function downloadSaft(xml: string, filename = 'SAFT_AO.xml') {
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ===== Example usage (remove in production) =====
// const empresa: Empresa = { nome: 'Gestor de Vendas Angola', nif: '123456789' }
// const impostos: Imposto[] = [{ codigo: 'IVA', descricao: 'Imposto sobre o Valor Acrescentado', taxa: 14 }]
// const clientes: Cliente[] = [{ id: 'C001', nome: 'Cliente A', nif: '500000000' }]
// const produtos: Produto[] = [{ id: 'P001', nome: 'Produto X', precoUnitario: 1000, impostoCodigo: 'IVA' }]
// const faturas: Fatura[] = [{
//   numero: 'FT001', data: '2026-01-11', clienteId: 'C001', moeda: 'AOA',
//   linhas: [{ produtoId: 'P001', quantidade: 2, precoUnitario: 1000, impostoCodigo: 'IVA', desconto: 0 }]
// }]
// const xml = gerarSaftAO(empresa, clientes, produtos, impostos, faturas)
// downloadSaft(xml)￼Enter// src/utils/saftAO.ts

// ===== Types =====
export interface Empresa {
  nome: string
  nif: string
  endereco?: string
  municipio?: string
  provincia?: string
  telefone?: string
  email?: string
  softwareNome?: string
  softwareVersao?: string
}

export interface Imposto {
  codigo: string        // e.g., IVA
  descricao: string     // e.g., Imposto sobre o Valor Acrescentado
  taxa: number          // e.g., 14
}

export interface Cliente {
  id: string
  nome: string
  nif?: string
  endereco?: string
  municipio?: string
  provincia?: string
  telefone?: string
  email?: string
}

export interface Produto {
  id: string
  nome: string
  codigo?: string
  precoUnitario: number
  unidade?: string      // e.g., UN, KG
  impostoCodigo?: string
ort interface LinhaFatura {
  produtoId: string
  descricao?: string
  quantidade: number
  precoUnitario: number
  impostoCodigo?: string
  desconto?: number     // valor monetário
}

export interface Fatura {
  numero: string
  data: string          // YYYY-MM-DD
  clienteId: string
  linhas: LinhaFatura[]
  moeda?: string        // e.g., AOA
  observacoes?: string
}

// ===== Helpers =====
const esc = (v?: string | number) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const fmt = (n: number) => n.toFixed(2)

function calcularTotaisFatura(linhas: LinhaFatura[], impostos: Imposto[]) {
  let totalSemImposto = 0
  let totalImposto = 0

  const mapaImpostos = new Map<string, number>() // codigo -> total imposto

  for (const l of linhas) {
    const base = l.quantidade * l.precoUnitario - (l.desconto ?? 0)
    totalSemImposto += base

    const imp = impostos.find(i => i.codigo === l.impostoCodigo)
    const valorImp = imp ? (base * imp.taxa) / 100 : 0
    totalImposto += valorImp

    if (imp) {
      mapaImpostos.set(imp.codigo, (mapaImpostos.get(imp.codigo) ?? 0) + valorImp)
    }
  }

  const total = totalSemImposto + totalImposto
  return { totalSemImposto, totalImposto, total, mapaImpostos }
}

// ===== Main generator =====
export function gerarSaftAO(
  empresa: Empresa,
  clientes: Cliente[],
  produtos: Produto[],
  impostos: Imposto[],
  faturas: Fatura[]
): string {
  const nowISO = new Date().toISOString()

  const headerXML = `
    <Header>
      <CompanyName>${esc(empresa.nome)}</CompanyName>
      <TaxID>${esc(empresa.nif)}</TaxID>
      <Address>${esc(empresa.endereco)}</Address>
      <Municipality>${esc(empresa.municipio)}</Municipality>
      <Province>${esc(empresa.provincia)}</Province>
      <Telephone>${esc(empresa.telefone)}</Telephone>
      <Email>${esc(empresa.email)}</Email>
      <SoftwareName>${esc(empresa.softwareNome ?? 'Gestor de Vendas Angola')}</SoftwareName>
      <SoftwareVersion>${esc(empresa.softwareVersao ?? '1.0')}</SoftwareVersion>
      <FileDate>${esc(nowISO)}</FileDate>
    </Header>
  `.trim()

  const masterFilesXML = `
    <MasterFiles>
      <Customers>
        ${clientes.map(c => `
          <Customer>
            <CustomerID>${esc(c.id)}</CustomerID>
            <CustomerName>${esc(c.nome)}</CustomerName>
            <TaxID>${esc(c.nif)}</TaxID>
            <Address>${esc(c.endereco)}</Address>
            <Municipality>${esc(c.municipio)}</Municipality>
            <Province>${esc(c.provincia)}</Province>
            <Telephone>${esc(c.telefone)}</Telephone>
            <Email>${esc(c.email)}</Email>
          </Customer>
        `.trim()).join('')}
      </Customers>
      <Products>
        ${produtos.map(p => `
          <Product>
            <ProductID>${esc(p.id)}</ProductID>
            <ProductCode>${esc(p.codigo)}</ProductCode>
            <ProductDescription>${esc(p.nome)}</ProductDescription>
            <UnitPrice>${fmt(p.precoUnitario)}</UnitPrice>
            <UnitOfMeasure>${esc(p.unidade ?? 'UN')}</UnitOfMeasure>
            <TaxCode>${esc(p.impostoCodigo ?? '')}</TaxCode>
          </Product>
        `.trim()).join('')}
      </Products>
      <Taxes>
        ${impostos.map(t => `
          <Tax>
