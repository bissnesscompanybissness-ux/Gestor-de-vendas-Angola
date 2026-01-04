import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { CURRENCY, IVA_RATE } from '../constants';
import { Link } from 'react-router-dom';

const Cart: React.FC = () => {
  const { products, cart, addToCart, removeFromCart, clearCart } = useContext(AppContext);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  
  // Estado para gerir a confirmação de remoção por item
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const availableProducts = products.filter(p => p.stock > 0);

  const handleAddToCart = () => {
    const productToAdd = availableProducts.find(p => p.id === selectedProductId);
    const qty = parseInt(quantity, 10);

    if (!productToAdd) {
      alert('Por favor, selecione um produto válido.');
      return;
    }

    // 1. Verificação de Quantidade Inválida ou Excesso de Stock
    if (qty <= 0 || qty > productToAdd.stock) {
      alert(`Erro: Quantidade inválida. Temos apenas ${productToAdd.stock} unidades em stock.`);
      return;
    }

    // 2. Verificação de Stock Baixo (Requisito do Utilizador)
    const remainingStockAfter = productToAdd.stock - qty;
    
    if (productToAdd.stock < 10) {
      alert(`⚠️ ALERTA DE STOCK CRÍTICO:\nO produto "${productToAdd.name}" já se encontra com stock baixo (${productToAdd.stock} unidades).`);
    } else if (remainingStockAfter < 10) {
      alert(`⚠️ AVISO DE REPOSIÇÃO:\nApós adicionar estas ${qty} unidades, o stock de "${productToAdd.name}" ficará abaixo do limite de segurança (restarão apenas ${remainingStockAfter} unidades).`);
    }

    addToCart(selectedProductId, qty);
    setSelectedProductId('');
    setQuantity('1');
  };

  const handleConfirmRemove = (productId: string) => {
    removeFromCart(productId);
    setConfirmRemoveId(null);
  };

  const totalCartValue = useMemo(() => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  }, [cart, products]);

  const ivaAmount = totalCartValue * IVA_RATE;
  const totalWithIVA = totalCartValue + ivaAmount;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primaryBlue">Carrinho de Compras</h1>

      <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">📦 Adicionar Itens</h2>
        <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-500 mb-1 ml-1">Produto</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="block w-full border-gray-300 rounded-xl shadow-sm py-4 px-4 text-lg focus:ring-primaryBlue focus:border-primaryBlue bg-gray-50 font-medium"
            >
              <option value="">-- Selecione o Produto --</option>
              {availableProducts.map(product => (
                <option key={product.id} value={product.id} className={product.stock < 10 ? 'text-red-600 font-bold' : ''}>
                  {product.name} ({product.stock} un.) {product.stock < 10 ? '⚠️ LOW STOCK' : ''} - {product.price.toLocaleString('pt-AO')} {CURRENCY}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-32">
            <label className="block text-sm font-bold text-gray-500 mb-1 ml-1">Qtd.</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="block w-full border-gray-300 rounded-xl shadow-sm py-4 px-4 text-lg focus:ring-primaryBlue focus:border-primaryBlue bg-gray-50 text-center font-bold"
              min="1"
            />
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full md:w-auto bg-primaryBlue text-white py-4 px-8 text-lg font-black rounded-xl transition duration-300 hover:bg-blue-800 shadow-lg active:scale-95"
          >
            ADICIONAR (+)
          </button>
        </div>

        <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">🛒 Itens no Carrinho</h2>
        {cart.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-400 italic">O carrinho está vazio. Comece a adicionar produtos acima.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 mb-6">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider rounded-tl-xl">Produto</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Qtd.</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Preço Unit.</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider rounded-tr-xl">Ação</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {cart.map((item) => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <tr key={item.productId} className="hover:bg-blue-50/30 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-center font-medium text-gray-700">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-right text-gray-600">{item.price.toLocaleString('pt-AO')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-right font-black text-primaryBlue">{(item.quantity * item.price).toLocaleString('pt-AO')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {confirmRemoveId === item.productId ? (
                          <div className="flex justify-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                            <button
                              onClick={() => handleConfirmRemove(item.productId)}
                              className="bg-red-600 text-white p-2 px-3 rounded-lg hover:bg-red-700 transition shadow-md font-black text-[10px]"
                            >
                              APAGAR
                            </button>
                            <button
                              onClick={() => setConfirmRemoveId(null)}
                              className="bg-gray-200 text-gray-700 p-2 px-3 rounded-lg hover:bg-gray-300 transition shadow-sm font-bold text-[10px]"
                            >
                              VOLTAR
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmRemoveId(item.productId)}
                            className="text-red-500 hover:text-red-700 font-black p-2 rounded-lg hover:bg-red-50 transition"
                          >
                            Remover
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {cart.length > 0 && (
          <div className="mt-8 space-y-2 border-t pt-6">
            <div className="flex justify-between items-center px-4 py-2">
              <span className="text-gray-500 font-bold">SUBTOTAL:</span>
              <span className="text-xl font-bold text-gray-700">{totalCartValue.toLocaleString('pt-AO')} {CURRENCY}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2">
              <span className="text-gray-500 font-bold">IVA ({(IVA_RATE * 100).toFixed(0)}%):</span>
              <span className="text-xl font-bold text-gray-700">{ivaAmount.toLocaleString('pt-AO')} {CURRENCY}</span>
            </div>
            <div className="flex justify-between items-center bg-primaryBlue text-white p-6 rounded-2xl shadow-lg transform scale-[1.02]">
              <span className="text-xl font-black">TOTAL A PAGAR:</span>
              <span className="text-3xl font-black">{totalWithIVA.toLocaleString('pt-AO')} {CURRENCY}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mt-10">
          <Link to="/sales" className="flex-1">
            <button
              disabled={cart.length === 0}
              className="w-full bg-primaryGreen text-white py-5 px-8 text-2xl font-black rounded-2xl transition duration-300 hover:bg-green-700 shadow-xl disabled:bg-gray-300 disabled:shadow-none active:scale-95"
            >
              CONFIRMAR VENDA →
            </button>
          </Link>
          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="w-full md:w-auto bg-gray-100 text-gray-500 py-5 px-8 text-lg font-bold rounded-2xl transition duration-300 hover:bg-gray-200 disabled:opacity-50"
          >
            LIMPAR TUDO
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/invoices" className="text-primaryBlue font-bold hover:underline">
            📋 Ver Histórico de Vendas Realizadas
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;