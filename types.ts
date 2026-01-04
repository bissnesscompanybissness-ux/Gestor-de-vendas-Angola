export enum ProductCategory {
  BEBIDAS = 'Bebidas',
  COMIDA = 'Comida',
  ELETRONICOS = 'Eletrónicos',
  VESTUARIO = 'Vestuário',
  HIGIENE = 'Higiene',
  FERRAMENTAS = 'Ferramentas',
  AGROINDUSTRIA = 'Agroindústria',
  SERVICOS = 'Serviços',
  MARKETING_DIGITAL = 'Marketing Digital',
  IA_SOFTWARE = 'IA & Software',
  CONSTRUCAO = 'Construção',
  PAPELARIA = 'Papelaria',
  SAUDE_BELEZA = 'Saúde & Beleza',
  LIMPEZA = 'Limpeza',
  INFORMATICA = 'Informática',
  MOBILIARIO = 'Mobiliário',
  AUTOMOTIVO = 'Automotivo',
  SEMENTES = 'Sementes & Plantas',
  FERTILIZANTES = 'Fertilizantes',
  MAQUINARIA = 'Maquinaria',
  CONSULTORIA = 'Consultoria',
  OUTROS = 'Outros',
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: ProductCategory;
  imageUrl?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  city: string;
  pendingAmount: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  clientId: string;
  items: CartItem[];
  total: number;
  iva: number;
  date: string;
}

export interface Invoice extends Sale {
  invoiceNumber: string;
  pdfDataUrl?: string;
}

export enum MerchantPlan {
  GRATIS = 'GRÁTIS',
  PRO5K = 'PRO5K',
  VIP15K = 'VIP15K',
}

export interface Merchant {
  name: string;
  phone: string;
  storeName: string;
  city: string;
  plan: MerchantPlan;
  multicaixaActive: boolean;
}

export interface AppContextType {
  products: Product[];
  clients: Client[];
  cart: CartItem[];
  sales: Sale[];
  invoices: Invoice[];
  merchant: Merchant | null;
  addProduct: (product: Product) => void;
  updateProductStock: (productId: string, quantity: number) => void;
  deleteProduct: (productId: string) => void;
  addClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;
  updateClientPendingAmount: (clientId: string, amount: number) => void;
  addToCart: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  completeSale: (clientId: string, total: number, iva: number, clientDirect?: Client) => Promise<Invoice | undefined>;
  setMerchant: (merchant: Merchant) => void;
}