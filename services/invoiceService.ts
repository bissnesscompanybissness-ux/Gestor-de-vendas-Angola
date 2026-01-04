import { jsPDF } from 'jspdf';
import { Invoice, Client, Merchant, Product } from '../types';
import { CURRENCY, IVA_RATE } from '../constants';

// A helper to format numbers to Angolan currency
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('pt-AO', { style: 'currency', currency: CURRENCY });
};

export const generateInvoicePdf = async (
  invoice: Invoice,
  client: Client,
  merchant: Merchant,
  products: Product[],
): Promise<string> => {
  const doc = new jsPDF();

  // Set font
  doc.setFont('helvetica');

  // Angolan Green/Blue Header
  doc.setFillColor(30, 64, 175); // primaryBlue
  doc.rect(0, 0, doc.internal.pageSize.width, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('FATURA', 10, 15);
  doc.setFontSize(10);
  doc.text(`Nº: ${invoice.invoiceNumber}`, doc.internal.pageSize.width - 40, 10, { align: 'right' });
  doc.text(`Data: ${new Date(invoice.date).toLocaleDateString('pt-AO')}`, doc.internal.pageSize.width - 40, 20, { align: 'right' });

  // Merchant Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`${merchant.storeName}`, 10, 35);
  doc.text(`Telefone: ${merchant.phone}`, 10, 42);
  doc.text(`Cidade: ${merchant.city}`, 10, 49);

  // Client Details
  doc.setFontSize(12);
  doc.text('Cliente:', 10, 65);
  doc.text(`Nome: ${client.name}`, 10, 72);
  doc.text(`Telefone: ${client.phone}`, 10, 79);
  doc.text(`CPF/NIF: N/A`, 10, 86); // Assuming CPF/NIF is not in Client type, using N/A

  // Invoice Items Table Header
  let y = 100;
  doc.setFillColor(209, 213, 219); // gray-300
  doc.rect(10, y, 190, 10, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('Item', 12, y + 7);
  doc.text('Qtde', 90, y + 7);
  doc.text('Preço Unit.', 120, y + 7);
  doc.text('Subtotal', 175, y + 7, { align: 'right' });
  y += 10;

  // Invoice Items
  invoice.items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      doc.text(product.name, 12, y + 7);
      doc.text(item.quantity.toString(), 90, y + 7);
      doc.text(formatCurrency(item.price), 120, y + 7);
      doc.text(formatCurrency(item.quantity * item.price), 175, y + 7, { align: 'right' });
      y += 10;
    }
  });

  // Totals
  y += 10;
  const subtotal = invoice.total - invoice.iva;
  doc.setFontSize(12);
  doc.text(`Subtotal:`, doc.internal.pageSize.width - 60, y, { align: 'right' });
  doc.text(formatCurrency(subtotal), doc.internal.pageSize.width - 15, y, { align: 'right' });
  y += 7;
  doc.text(`IVA (${(IVA_RATE * 100).toFixed(0)}%):`, doc.internal.pageSize.width - 60, y, { align: 'right' });
  doc.text(formatCurrency(invoice.iva), doc.internal.pageSize.width - 15, y, { align: 'right' });
  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(22, 163, 74); // primaryGreen
  doc.text(`Total:`, doc.internal.pageSize.width - 60, y, { align: 'right' });
  doc.text(formatCurrency(invoice.total), doc.internal.pageSize.width - 15, y, { align: 'right' });

  // Footer
  doc.setTextColor(156, 163, 175); // gray-400
  doc.setFontSize(8);
  doc.text('Obrigado pela sua preferência!', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });

  return doc.output('datauristring');
};

export const getWhatsAppLink = (
  phone: string,
  message: string,
  fileDataUrl?: string, // Base64 Data URL for the PDF
): string => {
  // WhatsApp Web API does not directly support sending files from a data URL in a single click.
  // The most common approach is to send the text message and provide instructions or a link if the PDF is hosted.
  // For this local app, we'll provide a message and ask the user to manually attach the downloaded PDF.

  // Phone number for Angola usually starts with 244
  const formattedPhone = phone.startsWith('244') ? phone : `244${phone}`;

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);

  // If you had a hosted PDF, it would look like this:
  // `https://wa.me/${formattedPhone}?text=${encodedMessage}&attachment=${encodedPdfUrl}`
  // Since we don't have hosting, we just send the message.
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};
