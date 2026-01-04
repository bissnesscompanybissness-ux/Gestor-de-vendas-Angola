import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { CURRENCY, WHATSAPP_TEMPLATES } from '../constants';
import { generateInvoicePdf, getWhatsAppLink } from '../services/invoiceService';
import { Invoice } from '../types';

const InvoiceHistory: React.FC = () => {
  const { invoices, clients, products, merchant } = useContext(AppContext);

  const handleRegenerateAndDownload = async (invoice: Invoice) => {
    const client = clients.find(c => c.id === invoice.clientId);
    if (!client || !merchant) {
      alert('Dados do cliente ou comerciante incompletos para regenerar a fatura.');
      return;
    }

    try {
      const pdfDataUrl = await generateInvoicePdf(invoice, client, merchant, products);
      const link = document.createElement('a');
      link.href = pdfDataUrl;
      link.download = `Fatura_${invoice.invoiceNumber}_Regenerada.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('Fatura regenerada e baixada com sucesso!');
    } catch (error) {
      console.error('Erro ao regenerar fatura:', error);
      alert('Falha ao regenerar a fatura.');
    }
  };

  const handleWhatsAppSend = (invoice: Invoice) => {
    const client = clients.find(c => c.id === invoice.clientId);
    if (!client || !merchant) {
      alert('Dados do cliente ou comerciante incompletos para enviar a fatura.');
      return;
    }

    const message = WHATSAPP_TEMPLATES.INVOICE(
      client.name,
      invoice.invoiceNumber,
      invoice.total.toLocaleString('pt-AO') + ' ' + CURRENCY
    ).replace('[Nome da Sua Loja]', merchant.storeName);

    const whatsappLink = getWhatsAppLink(client.phone, message, invoice.pdfDataUrl);
    window.open(whatsappLink, '_blank');
    alert('Aguarde a abertura do WhatsApp para enviar a fatura. Lembre-se de anexar o PDF manualmente!');
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primaryBlue">Histórico de Faturas</h1>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        {invoices.length === 0 ? (
          <p className="text-lg text-gray-600">Nenhuma fatura emitida ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Nº Fatura
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Subtotal ({CURRENCY})
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    IVA (14%)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Total ({CURRENCY})
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.slice().reverse().map((invoice) => { // Display newest first
                  const client = clients.find(c => c.id === invoice.clientId);
                  const subtotal = invoice.total - invoice.iva;
                  
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500">
                        {client?.name || 'Cliente Desconhecido'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500">
                        {new Date(invoice.date).toLocaleDateString('pt-AO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500">
                        {subtotal.toLocaleString('pt-AO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-400 italic">
                        {invoice.iva.toLocaleString('pt-AO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-primaryGreen font-bold">
                        {invoice.total.toLocaleString('pt-AO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleRegenerateAndDownload(invoice)}
                            className="bg-primaryBlue text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition shadow-sm font-semibold"
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => handleWhatsAppSend(invoice)}
                            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition shadow-sm font-semibold"
                          >
                            WhatsApp
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceHistory;