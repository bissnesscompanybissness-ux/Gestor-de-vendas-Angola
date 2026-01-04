import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Merchant, MerchantPlan } from '../types';
import { INITIAL_MERCHANT, LOCAL_STORAGE_KEYS } from '../constants';

const MerchantRegistration: React.FC = () => {
  const { merchant, setMerchant } = useContext(AppContext);

  const [name, setName] = useState(merchant?.name || INITIAL_MERCHANT.name);
  const [phone, setPhone] = useState(merchant?.phone || INITIAL_MERCHANT.phone);
  const [storeName, setStoreName] = useState(merchant?.storeName || INITIAL_MERCHANT.storeName);
  const [city, setCity] = useState(merchant?.city || INITIAL_MERCHANT.city);
  const [plan, setPlan] = useState<MerchantPlan>(merchant?.plan || MerchantPlan.GRATIS);
  const [multicaixaActive, setMulticaixaActive] = useState(merchant?.multicaixaActive || false);

  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (merchant) {
      setName(merchant.name);
      setPhone(merchant.phone);
      setStoreName(merchant.storeName);
      setCity(merchant.city);
      setPlan(merchant.plan);
      setMulticaixaActive(merchant.multicaixaActive);
    }
  }, [merchant]);

  const handleExportBackup = () => {
    const backupData = {
      products: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS) || '[]'),
      clients: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.CLIENTS) || '[]'),
      sales: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.SALES) || '[]'),
      invoices: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.INVOICES) || '[]'),
      merchant: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.MERCHANT) || 'null'),
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_vendas_angola_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedback({ message: '✓ BACKUP EXPORTADO COM SUCESSO!', type: 'success' });
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm("ATENÇÃO: Importar um backup irá substituir todos os dados atuais. Deseja continuar?")) {
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.products && data.clients) {
          localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
          localStorage.setItem(LOCAL_STORAGE_KEYS.CLIENTS, JSON.stringify(data.clients));
          localStorage.setItem(LOCAL_STORAGE_KEYS.SALES, JSON.stringify(data.sales));
          localStorage.setItem(LOCAL_STORAGE_KEYS.INVOICES, JSON.stringify(data.invoices));
          localStorage.setItem(LOCAL_STORAGE_KEYS.MERCHANT, JSON.stringify(data.merchant));
          
          setFeedback({ message: '✓ DADOS RESTAURADOS! REINICIANDO...', type: 'success' });
          setTimeout(() => window.location.reload(), 2000);
        } else {
          throw new Error("Formato de backup inválido.");
        }
      } catch (err) {
        setFeedback({ message: 'ERRO AO IMPORTAR BACKUP.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !phone || !storeName || !city) {
      setFeedback({ message: 'Preencha todos os campos.', type: 'error' });
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      const updatedMerchant: Merchant = { name, phone, storeName, city, plan, multicaixaActive };
      setMerchant(updatedMerchant);
      setFeedback({ message: '✓ DADOS ATUALIZADOS!', type: 'success' });
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primaryBlue text-center">Configurações</h1>

      {feedback && (
        <div className={`mb-6 p-4 rounded-xl text-white font-bold text-center animate-pulse ${feedback.type === 'success' ? 'bg-primaryGreen' : 'bg-red-600'}`}>
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl space-y-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Dados do Comerciante</h2>
        <div className="grid grid-cols-1 gap-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border-gray-300 rounded-lg p-4 text-lg bg-gray-50" placeholder="Nome do Comerciante" required />
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border-gray-300 rounded-lg p-4 text-lg bg-gray-50" placeholder="Telefone" required />
          <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full border-gray-300 rounded-lg p-4 text-lg bg-gray-50" placeholder="Nome da Loja" required />
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full border-gray-300 rounded-lg p-4 text-lg bg-gray-50" placeholder="Província" required />
        </div>
        <button type="submit" disabled={isSaving} className="w-full bg-primaryBlue text-white py-4 rounded-xl font-bold text-xl hover:bg-blue-800 transition">
          {isSaving ? 'A SALVAR...' : 'GUARDAR ALTERAÇÕES'}
        </button>
      </form>

      <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-red-600 border-b pb-2">Segurança Offline (Backup)</h2>
        <p className="text-gray-600 text-sm">Como este App funciona offline, seus dados estão apenas neste navegador. Recomendamos exportar um backup regularmente.</p>
        
        <div className="flex flex-col gap-4">
          <button onClick={handleExportBackup} className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition">
            📥 EXPORTAR BACKUP (.JSON)
          </button>
          
          <label className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-200 border-2 border-dashed border-gray-300">
            📤 IMPORTAR BACKUP
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};

export default MerchantRegistration;