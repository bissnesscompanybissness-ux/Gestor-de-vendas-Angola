import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { ProductCategory, Product } from '../types';
import { v4 as uuidv4 } from 'uuid';

const ProductForm: React.FC = () => {
  const { addProduct } = useContext(AppContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [price, setPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [category, setCategory] = useState<ProductCategory>(ProductCategory.OUTROS);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string); // Store as Data URL
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImageUrl(undefined);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name || !price || !stock) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newProduct: Product = {
      id: uuidv4(),
      name,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      category,
      imageUrl: imageUrl || `https://picsum.photos/100/100?random=${Math.random() * 100}`,
    };

    addProduct(newProduct);
    alert('Produto salvo com sucesso!');
    navigate('/stock');
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primaryBlue">Novo Produto</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-6">
        <div>
          <label htmlFor="name" className="block text-lg font-medium text-gray-700 mb-1">
            Nome do Produto
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 text-lg focus:ring-primaryBlue focus:border-primaryBlue"
            placeholder="Ex: Coca-Cola 1L"
            required
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-lg font-medium text-gray-700 mb-1">
            Preço ({`${parseFloat(price) ? parseFloat(price).toLocaleString('pt-AO') : '0'} AOA`})
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 text-lg focus:ring-primaryBlue focus:border-primaryBlue"
            placeholder="Ex: 250"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label htmlFor="stock" className="block text-lg font-medium text-gray-700 mb-1">
            Stock
          </label>
          <input
            type="number"
            id="stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 text-lg focus:ring-primaryBlue focus:border-primaryBlue"
            placeholder="Ex: 100"
            min="0"
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-lg font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 text-lg focus:ring-primaryBlue focus:border-primaryBlue"
          >
            {Object.values(ProductCategory).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="image" className="block text-lg font-medium text-gray-700 mb-1">
            Upload Foto
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-lg file:font-semibold file:bg-primaryBlue file:text-white hover:file:bg-blue-800"
          />
          {imageUrl && (
            <div className="mt-4">
              <img src={imageUrl} alt="Pré-visualização do produto" className="w-32 h-32 object-cover rounded-lg shadow-md" />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-primaryGreen text-white py-4 px-8 text-xl font-bold rounded-lg transition duration-300 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-primaryGreen focus:ring-opacity-50"
        >
          Salvar Produto
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
