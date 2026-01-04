import { ProductCategory, MerchantPlan } from './types';

export const CURRENCY = 'AOA';
export const IVA_RATE = 0.14; // 14% IVA in Angola

export const LOCAL_STORAGE_KEYS = {
  PRODUCTS: 'gestorVendas_products',
  CLIENTS: 'gestorVendas_clients',
  CART: 'gestorVendas_cart',
  SALES: 'gestorVendas_sales',
  INVOICES: 'gestorVendas_invoices',
  MERCHANT: 'gestorVendas_merchant',
};

export const INITIAL_PRODUCTS = [
  { id: 'prod-001', name: 'Refrigerante Cola 1L', price: 250, stock: 120, category: ProductCategory.BEBIDAS, imageUrl: 'https://picsum.photos/100/100?random=1' },
  { id: 'prod-002', name: 'Arroz Bom Gosto 5kg', price: 4500, stock: 50, category: ProductCategory.COMIDA, imageUrl: 'https://picsum.photos/100/100?random=2' },
  { id: 'prod-003', name: 'Smartphone K5 Pro', price: 75000, stock: 15, category: ProductCategory.ELETRONICOS, imageUrl: 'https://picsum.photos/100/100?random=3' },
  { id: 'prod-004', name: 'Água Mineral 1.5L', price: 150, stock: 200, category: ProductCategory.BEBIDAS, imageUrl: 'https://picsum.photos/100/100?random=4' },
  { id: 'prod-005', name: 'Pão de Forma Nutri', price: 600, stock: 30, category: ProductCategory.COMIDA, imageUrl: 'https://picsum.photos/100/100?random=5' },
];

// 15 clientes pendentes conforme solicitado
export const INITIAL_CLIENTS = Array.from({ length: 15 }, (_, i) => ({
  id: `client-p-${i}`,
  name: `Cliente Pendente ${i + 1}`,
  phone: `2449000000${i}`,
  city: 'Luanda',
  pendingAmount: 15000 + (i * 1000)
}));

export const INITIAL_MERCHANT = {
  name: 'João Luís',
  phone: '244999123456',
  storeName: 'João Luís Marketing Digital IA Agroindústria e Serviços',
  city: 'Luanda',
  plan: MerchantPlan.GRATIS,
  multicaixaActive: false,
};

// Venda de exemplo para totalizar 2.450.000 AOA hoje
export const INITIAL_SALES = [
  {
    id: 'sale-init-001',
    clientId: 'client-p-0',
    items: [{ productId: 'prod-003', quantity: 1, price: 2450000 }],
    total: 2450000,
    iva: 343000,
    date: new Date().toISOString()
  }
];

export const WHATSAPP_TEMPLATES = {
  INVOICE: (clientName: string, invoiceNumber: string, total: string) =>
    `Olá ${clientName},\n\nA sua fatura Nº ${invoiceNumber} no valor de ${total} AOA está pronta.\n\nAtenciosamente,\n[Nome da Sua Loja]`,
  PENDING_REMINDER: (clientName: string, pendingAmount: string) =>
    `Olá ${clientName},\n\nGostaríamos de lembrar que tem um valor pendente de ${pendingAmount} AOA.\n\nPor favor, entre em contacto para regularizar.\n\nObrigado,\n[Nome da Sua Loja]`,
};