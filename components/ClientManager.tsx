import React, { useContext, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Client } from '../types';
import { CURRENCY, WHATSAPP_TEMPLATES } from '../constants';
import { getWhatsAppLink } from '../services/invoiceService';
import { v4 as uuidv4 } from 'uuid';

const ClientManager: React.FC = () => {
  const { clients, addClient, deleteClient } = useContext(AppContext);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientCity, setNewClientCity] = useState('');
  const [newClientPendingAmount, setNewClientPendingAmount] = useState<string>('0');
  
  // Estado para gerir a confirmação de exclusão por cliente
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAddClient = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newClientName || !newClientPhone || !newClientCity) {
      alert('Por favor, preencha todos os campos do cliente.');
      return;
    }

    const newClient: Client = {
      id: uuidv4(),
      name: newClientName,
      phone: newClientPhone,
      city: newClientCity,
      pendingAmount: parseFloat(newClientPendingAmount || '0'),
    };
    addClient(newClient);
    alert('Cliente adicionado com sucesso!');
    setNewClientName('');
    setNewClientPhone('');
    setNewClientCity('');
    setNewClientPendingAmount('0');
  };

  const handleConfirmDelete = (clientId: string) => {
    deleteClient(clientId);
    setConfirmDeleteId(null);
  };

  const handleWhatsAppClick = (client: Client, type: 'invoice' | 'pending') => {
    let message = '';
    if (type === 'invoice') {
      message = `Olá ${client.name}, como podemos ajudar hoje?`;
    } else if (type === 'pending') {
      message = WHATSAPP_TEMPLATES.PENDING_REMINDER(
        client.name,
        client.pendingAmount.toLocaleString('pt-AO') + ' ' + CURRENCY
      );
    }
    const whatsappLink = getWhatsAppLink(client.phone, message);
    window.open(whatsappLink, '_blank');
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Nome', 'Telefone', 'Cidade', 'Valor Pendente'];
    const rows = clients.map(client => [
      client.id,
      client.name,
      client.phone,
      client.city,
      client.pendingAmount.toFixed(2),
    ]);

    let csvContent = headers.join(';') + '\n';
    rows.forEach(row => {
      csvContent += row.join(';') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'clientes_angola.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    alert('Ficheiro CSV exportado com sucesso!');
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primaryBlue">Gestão de Clientes</h1>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Adicionar Novo Cliente</h2>
        <form onSubmit={handleAddClient} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="clientName" className="block text-sm font-bold text-gray-500 mb-1 ml-1">
                Nome Completo
              </label>
              <input
                type="text"
                id="clientName"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm py-3 px-4 text-lg focus:ring-primaryBlue focus:border-primaryBlue bg-gray-50"
                placeholder="Ex: João Manuel"
                required
              />
            </div>
            <div>
              <label htmlFor="clientPhone" className="block text-sm font-bold text-gray-500 mb-1 ml-1">
                Telemóvel (ex: 923...)
              </label>
              <input
                type="text"
                id="clientPhone"
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm py-3 px-4 text-lg focus:ring-primaryBlue focus:border-primaryBlue bg-gray-50"
                placeholder="244XXXXXXXXX"
                required
              />
            </div>
            <div>
              <label htmlFor="clientCity" className="block text-sm font-bold text-gray-500 mb-1 ml-1">
                Província / Cidade
              </label>
              <input
                type="text"
                id="clientCity"
                value={newClientCity}
                onChange={(e) => setNewClientCity(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm py-3 px-4 text-lg focus:ring-primaryBlue focus:border-primaryBlue bg-gray-50"
                placeholder="Ex: Luanda"
                required
              />
            </div>
            <div>
              <label htmlFor="clientPendingAmount" className="block text-sm font-bold text-gray-500 mb-1 ml-1">
                Dívida Inicial ({CURRENCY})
              </label>
              <input
                type="number"
                id="clientPendingAmount"
                value={newClientPendingAmount}
                onChange={(e) => setNewClientPendingAmount(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm py-3 px-4 text-lg focus:ring-primaryBlue focus:border-primaryBlue bg-gray-50"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-primaryGreen text-white py-4 px-8 text-xl font-black rounded-xl transition duration-300 hover:bg-green-700 shadow-lg active:scale-95"
          >
            ADICIONAR CLIENTE (+)
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="bg-primaryBlue w-2 h-8 rounded-full"></span>
          Lista de Clientes Cadastrados
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Dívida ({CURRENCY})</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">Nenhum cliente registado.</td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900 group-hover:text-primaryBlue">
                      {client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-600">
                      {client.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-right text-red-600 font-black">
                      {client.pendingAmount.toLocaleString('pt-AO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center gap-2">
                        {confirmDeleteId === client.id ? (
                          <div className="flex gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                            <button
                              onClick={() => handleConfirmDelete(client.id)}
                              className="bg-red-600 text-white p-2 px-3 rounded-lg hover:bg-red-700 transition shadow-md font-black text-[10px]"
                            >
                              APAGAR
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="bg-gray-200 text-gray-700 p-2 px-3 rounded-lg hover:bg-gray-300 transition shadow-sm font-bold text-[10px]"
                            >
                              VOLTAR
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleWhatsAppClick(client, 'pending')}
                              className="bg-green-500 text-white p-2 px-4 rounded-lg hover:bg-green-600 transition shadow-sm font-bold text-xs"
                              title="Enviar Cobrança WhatsApp"
                            >
                              COBRAR
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(client.id)}
                              className="bg-red-50 text-red-600 border border-red-100 p-2 px-4 rounded-lg hover:bg-red-600 hover:text-white transition shadow-sm font-bold text-xs"
                              title="Excluir Cliente"
                            >
                              EXCLUIR
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={handleExportCsv}
        className="w-full bg-gray-800 text-white py-4 px-8 text-xl font-bold rounded-xl transition duration-300 hover:bg-black shadow-lg flex items-center justify-center gap-3"
      >
        <span>📊</span> EXPORTAR PARA EXCEL (CSV)
      </button>
    </div>
  );
};

export default ClientManager;