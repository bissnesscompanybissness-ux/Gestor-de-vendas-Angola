import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { AppContextType, Product, Client, CartItem, Sale, Invoice, Merchant } from '../types';
import { saveData, loadData } from '../services/localStorageService';
import { LOCAL_STORAGE_KEYS, INITIAL_PRODUCTS, INITIAL_CLIENTS, INITIAL_MERCHANT, INITIAL_SALES } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { generateInvoicePdf } from '../services/invoiceService';

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() =>
    loadData(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS)
  );
  const [clients, setClients] = useState<Client[]>(() =>
    loadData(LOCAL_STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS)
  );
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadData(LOCAL_STORAGE_KEYS.CART, [])
  );
  const [sales, setSales] = useState<Sale[]>(() =>
    loadData(LOCAL_STORAGE_KEYS.SALES, INITIAL_SALES)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadData(LOCAL_STORAGE_KEYS.INVOICES, [])
  );
  const [merchant, setMerchant] = useState<Merchant | null>(() =>
    loadData(LOCAL_STORAGE_KEYS.MERCHANT, INITIAL_MERCHANT)
  );

  useEffect(() => { saveData(LOCAL_STORAGE_KEYS.PRODUCTS, products); }, [products]);
  useEffect(() => { saveData(LOCAL_STORAGE_KEYS.CLIENTS, clients); }, [clients]);
  useEffect(() => { saveData(LOCAL_STORAGE_KEYS.CART, cart); }, [cart]);
  useEffect(() => { saveData(LOCAL_STORAGE_KEYS.SALES, sales); }, [sales]);
  useEffect(() => { saveData(LOCAL_STORAGE_KEYS.INVOICES, invoices); }, [invoices]);
  useEffect(() => { saveData(LOCAL_STORAGE_KEYS.MERCHANT, merchant); }, [merchant]);

  const addProduct = useCallback((product: Product) => {
    setProducts((prev) => [...prev, product]);
  }, []);

  const updateProductStock = useCallback((productId: string, quantity: number) => {
    setProducts((prev) =>
      prev.map((p) => p.id === productId ? { ...p, stock: p.stock + quantity } : p)
    );
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const addClient = useCallback((client: Client) => {
    setClients((prev) => {
      if (prev.find(c => c.id === client.id)) return prev;
      return [...prev, client];
    });
  }, []);

  const deleteClient = useCallback((clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
  }, []);

  const updateClientPendingAmount = useCallback((clientId: string, amount: number) => {
    setClients((prev) =>
      prev.map((c) => c.id === clientId ? { ...c, pendingAmount: c.pendingAmount + amount } : c)
    );
  }, []);

  const addToCart = useCallback((productId: string, quantity: number) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.productId === productId);
      const product = products.find((p) => p.id === productId);
      if (!product) return prev;
      if (existingItem) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [...prev, { productId, quantity, price: product.price }];
      }
    });
    updateProductStock(productId, -quantity);
  }, [products, updateProductStock]);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => {
      const itemToRemove = prev.find((item) => item.productId === productId);
      if (itemToRemove) updateProductStock(productId, itemToRemove.quantity);
      return prev.filter((item) => item.productId !== productId);
    });
  }, [updateProductStock]);

  const clearCart = useCallback(() => setCart([]), []);

  const completeSale = useCallback(async (clientId: string, total: number, iva: number, clientDirect?: Client) => {
    if (!merchant) return undefined;

    const saleId = uuidv4();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(sales.length + 1).padStart(4, '0')}`;
    const saleDate = new Date().toISOString();

    const newSale: Sale = {
      id: saleId,
      clientId,
      items: [...cart],
      total,
      iva,
      date: saleDate,
    };

    // Usar o cliente passado diretamente ou procurar na lista
    const targetClient = clientDirect || clients.find(c => c.id === clientId);
    if (!targetClient) {
      console.error("Cliente não identificado para a fatura.");
      return undefined;
    }

    const newInvoice: Invoice = { ...newSale, invoiceNumber };

    try {
      const generatedPdfDataUrl = await generateInvoicePdf(newInvoice, targetClient, merchant, products);
      const invoiceWithPdf: Invoice = { ...newInvoice, pdfDataUrl: generatedPdfDataUrl };
      
      setSales((prev) => [...prev, newSale]);
      setInvoices((prev) => [...prev, invoiceWithPdf]);
      return invoiceWithPdf;
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      // Mesmo sem PDF, salvamos a venda
      setSales((prev) => [...prev, newSale]);
      setInvoices((prev) => [...prev, newInvoice]);
      return newInvoice;
    }
  }, [cart, clients, merchant, products, sales.length]);

  const contextValue = useMemo(() => ({
    products, clients, cart, sales, invoices, merchant,
    addProduct, updateProductStock, deleteProduct, addClient, deleteClient, updateClientPendingAmount,
    addToCart, removeFromCart, clearCart, completeSale, setMerchant,
  }), [products, clients, cart, sales, invoices, merchant, addProduct, updateProductStock, deleteProduct, addClient, deleteClient, updateClientPendingAmount, addToCart, removeFromCart, clearCart, completeSale, setMerchant]);

  return <AppContext.Provider value={contextValue as AppContextType}>{children}</AppContext.Provider>;
};