import React, { useContext, useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { ProductCategory } from '../types';
import { CURRENCY } from '../constants';

const StockManager: React.FC = () => {
  const { products, deleteProduct } = useContext(AppContext);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Todos'>('Todos');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Todos') {
      return products;
    }
    return products.filter(product => product.category === selectedCategory);
  }, [products, selectedCategory]);

  const initiateDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleConfirmDelete = (productId: string, productName: string) => {
    deleteProduct(productId);
    setFeedback(`Produto "${productName}" excluído com sucesso!`);
    setConfirmDeleteId(null);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-primaryBlue">Stock + Categorias</h1>
        <Link to="/products/new">
          <button className="bg-primaryGreen text-white py-3 px-6 text-lg font-bold rounded-lg transition duration-300 hover:bg-green-700 shadow-md">
            + Novo Produto
          </button>
        </Link>
      </div>

      {feedback && (
        <div className="mb-6 p-4 bg-primaryGreen text-white font-bold rounded-lg shadow-lg text-center animate-pulse text-xl">
          ✓ {feedback}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedCategory('Todos')}
          className={`py-3 px-6 rounded-lg text-lg font-semibold transition duration-200 shadow-sm
            ${selectedCategory === 'Todos' ? 'bg-primaryBlue text-white' : 'bg-white text-textDark border border-gray-200 hover:bg-gray-100'}`}
        >
          Todos
        </button>
        {Object.values(ProductCategory).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`py-3 px-6 rounded-lg text-lg font-semibold transition duration-200 shadow-sm
              ${selectedCategory === category ? 'bg-primaryBlue text-white' : 'bg-white text-textDark border border-gray-200 hover:bg-gray-100'}`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-8 overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Produto</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Preço ({CURRENCY})</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Categoria</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-lg">
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900">
                      <div className="flex items-center">
                        <img
                          src={product.imageUrl || `https://picsum.photos/100/100?random=${product.id}`}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover mr-4 border border-gray-100"
                        />
                        {product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg">
                      <span className={`px-3 py-1 rounded-full font-bold ${product.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900 font-semibold">
                      {product.price.toLocaleString('pt-AO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-lg">
                      {confirmDeleteId === product.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleConfirmDelete(product.id, product.name)}
                            className="bg-red-600 text-white py-1 px-3 rounded font-bold text-sm hover:bg-red-700"
                          >
                            Sim, Excluir
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="bg-gray-200 text-gray-700 py-1 px-3 rounded font-bold text-sm hover:bg-gray-300"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => initiateDelete(product.id)}
                          className="text-red-600 hover:text-red-900 font-bold bg-red-50 px-4 py-2 rounded-lg border border-red-100"
                        >
                          Excluir
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockManager;