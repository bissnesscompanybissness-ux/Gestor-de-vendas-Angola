import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { CURRENCY, IVA_RATE, WHATSAPP_TEMPLATES } from '../constants';
import { getWhatsAppLink } from '../services/invoiceService';
import { Client, Invoice } from '../types';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const SalesArea: React.FC = () => {
  const { products, clients, cart, completeSale, clearCart, merchant, addClient } = useContext(AppContext);
  const navigate = useNavigate();

  const [entryMode, setEntryMode] = useState<'select' | 'manual'>('select');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [manualClientName, setManualClientName] = useState('');
  const [manualClientPhone, setManualClientPhone] = useState('');

  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCartValue = useMemo(() => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  }, [cart, products]);

  const ivaAmount = totalCartValue * IVA_RATE;
  const totalWithIVA = totalCartValue + ivaAmount;

  const handleConfirmSale = async () => {
    if (cart.length === 0) {
      alert('O carrinho está vazio.');
      return;
    }

    if (!merchant) {
      alert('Configure os dados do comerciante primeiro.');
      navigate('/merchant');
      return;
    }

    let targetClient: Client | undefined;

    if (entryMode === 'select') {
      if (!selectedClientId) {
        alert('Selecione um cliente.');
        return;
      }
      targetClient = clients.find(c => c.id === selectedClientId);
    } else {
      if (!manualClientName.trim()) {
        alert('Escreva o nome do cliente.');
        return;
      }
      targetClient = {
        id: uuidv4(),
        name: manualClientName.trim(),
        phone: manualClientPhone.trim() || 'N/A',
        city: 'Luanda',
        pendingAmount: 0
      };
      // Importante: Adicionamos mas também passamos o objeto direto para evitar delay de estado
      addClient(targetClient);
    }

    if (!targetClient) return;

    setIsLoading(true);
    setError(null);
    try {
      // Passamos o targetClient como 4º argumento para garantir que o PDF tenha os dados
      const newInvoice = await completeSale(targetClient.id, totalWithIVA, ivaAmount, targetClient);
      if (newInvoice) {
        setGeneratedInvoice(newInvoice);
        alert('Venda confirmada com sucesso!');
        clearCart();
      } else {
        throw new Error('Erro ao processar a venda.');
      }
    } catch (err) {
      console.error(err);
      setError('Falha ao finalizar a venda. Verifique os dados e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (generatedInvoice?.pdfDataUrl) {
      const link = document.createElement('a');
      link.href = generatedInvoice.pdfDataUrl;
      link.download = `Fatura_${generatedInvoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Fatura não disponível para download.');
    }
  };

  const handleWhatsAppSend = () => {
    if (generatedInvoice && merchant) {
      // Usar os dados da fatura para garantir o preço real correto
      const client = clients.find(c => c.id === generatedInvoice.clientId) || { 
        name: manualClientName || 'Cliente', 
        phone: manualClientPhone || '' 
      };
      
      const message = WHATSAPP_TEMPLATES.INVOICE(
        client.name,
        generatedInvoice.invoiceNumber,
        generatedInvoice.total.toLocaleString('pt-AO')
      ).replace('[Nome da Sua Loja]', merchant.storeName);

      const whatsappLink = getWhatsAppLink(client.phone, message, generatedInvoice.pdfDataUrl);
      window.open(whatsappLink, '_blank');
    }
  };

  if (cart.length === 0 && !generatedInvoice) {
    return (
      <div className="p-4 md:p-8 text-center">
        <h1 className="text-3xl font-bold mb-8 text-primaryBlue">Área de Vendas</h1>
        <p className="text-xl text-gray-600 mb-6">Carrinho vazio.</p>
        <button onClick={() => navigate('/cart')} className="bg-primaryBlue text-white py-4 px-8 rounded-lg font-bold">Ir para o Carrinho</button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-primaryBlue">Área de Vendas</h1>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Resumo do Pagamento</h2>
        <div className="space-y-2 border-b pb-4 mb-4">
          <div className="flex justify-between"><span>Subtotal:</span><span className="font-bold">{totalCartValue.toLocaleString('pt-AO')} {CURRENCY}</span></div>
          <div className="flex justify-between"><span>IVA (14%):</span><span className="font-bold text-gray-500">{ivaAmount.toLocaleString('pt-AO')} {CURRENCY}</span></div>
        </div>
        <div className="flex justify-between bg-primaryBlue text-white p-4 rounded-lg">
          <span className="text-xl font-bold">TOTAL A PAGAR:</span>
          <span className="text-2xl font-black">{totalWithIVA.toLocaleString('pt-AO')} {CURRENCY}</span>
        </div>
      </div>

      {!generatedInvoice ? (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border-2 border-dashed border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Identificação do Cliente</h2>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setEntryMode('select')} className={`flex-1 py-3 rounded-lg font-bold ${entryMode === 'select' ? 'bg-primaryBlue text-white' : 'bg-gray-100 text-gray-500'}`}>📋 LISTA</button>
            <button onClick={() => setEntryMode('manual')} className={`flex-1 py-3 rounded-lg font-bold ${entryMode === 'manual' ? 'bg-primaryBlue text-white' : 'bg-gray-100 text-gray-500'}`}>✍️ ESCREVER</button>
          </div>

          {entryMode === 'select' ? (
            <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full p-4 text-lg border rounded-lg bg-gray-50">
              <option value="">-- Selecione o cliente --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ) : (
            <div className="space-y-4">
              <input type="text" placeholder="Nome do Cliente" value={manualClientName} onChange={(e) => setManualClientName(e.target.value)} className="w-full p-4 border rounded-lg" />
              <input type="text" placeholder="Telemóvel (Opcional)" value={manualClientPhone} onChange={(e) => setManualClientPhone(e.target.value)} className="w-full p-4 border rounded-lg" />
            </div>
          )}

          <button onClick={handleConfirmSale} disabled={isLoading} className="w-full mt-8 bg-primaryGreen text-white py-5 rounded-xl font-black text-xl shadow-xl hover:bg-green-700 transition">
            {isLoading ? 'A PROCESSAR...' : 'FINALIZAR E GERAR FATURA'}
          </button>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center border-4 border-primaryGreen animate-bounceIn">
          <h2 className="text-3xl font-black text-primaryGreen mb-4">VENDA CONCLUÍDA!</h2>
          <p className="text-xl mb-8">Fatura: <span className="font-bold text-primaryBlue">{generatedInvoice.invoiceNumber}</span></p>
          <div className="flex flex-col md:flex-row gap-4">
            <button onClick={handleDownloadPdf} className="flex-1 bg-primaryBlue text-white py-5 rounded-xl font-bold text-lg">📥 Baixar PDF</button>
            <button onClick={handleWhatsAppSend} className="flex-1 bg-green-500 text-white py-5 rounded-xl font-bold text-lg">💬 WhatsApp</button>
          </div>
          <button onClick={() => { setGeneratedInvoice(null); navigate('/cart'); }} className="mt-8 text-gray-500 underline font-bold">Nova Venda</button>
        </div>
      )}
      {error && <p className="text-red-600 font-bold mt-4 text-center">{error}</p>}
    </div>
  );
};

export default SalesArea;