import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CURRENCY } from '../constants';

const Dashboard: React.FC = () => {
  const { sales, clients, products, merchant } = useContext(AppContext);
  const [salesToday, setSalesToday] = useState(0);
  const [pendingClientsCount, setPendingClientsCount] = useState(0);
  const [chartData, setChartData] = useState<{ name: string; vendas: number }[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const dailySales = sales.filter(sale => sale.date.startsWith(today));
    const totalSalesToday = dailySales.reduce((sum, sale) => sum + sale.total, 0);
    setSalesToday(totalSalesToday);

    const pending = clients.filter(client => client.pendingAmount > 0);
    setPendingClientsCount(pending.length);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const tempChartData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateString = d.toISOString().split('T')[0];
      const daySales = sales
        .filter(sale => sale.date.startsWith(dateString))
        .reduce((sum, sale) => sum + sale.total, 0);
      return { name: d.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' }), vendas: daySales };
    });
    setChartData(tempChartData);

  }, [sales, clients]);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primaryBlue">Painel de Controlo</h1>
          {merchant && (
            <p className="text-lg text-gray-500 font-medium mt-1">
              Bem-vindo, <span className="text-primaryGreen font-bold">{merchant.name}</span>
            </p>
          )}
        </div>
        <div className="bg-primaryGreen/10 text-primaryGreen px-4 py-2 rounded-lg border border-primaryGreen/20 flex items-center gap-2 text-sm font-bold">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
          SISTEMA OFFLINE SEGURO
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-primaryGreen">
          <h2 className="text-sm font-bold text-gray-400 uppercase">Vendas Hoje</h2>
          <p className="text-2xl font-black text-gray-800 mt-1">
            {salesToday.toLocaleString('pt-AO')} {CURRENCY}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-primaryBlue">
          <h2 className="text-sm font-bold text-gray-400 uppercase">Dívidas Clientes</h2>
          <p className="text-2xl font-black text-gray-800 mt-1">
            {clients.reduce((acc, c) => acc + c.pendingAmount, 0).toLocaleString('pt-AO')} {CURRENCY}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-accentYellow">
          <h2 className="text-sm font-bold text-gray-400 uppercase">Produtos em Stock</h2>
          <p className="text-2xl font-black text-gray-800 mt-1">
            {products.length} Itens
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-gray-800">
          <h2 className="text-sm font-bold text-gray-400 uppercase">Total Faturas</h2>
          <p className="text-2xl font-black text-gray-800 mt-1">
            {sales.length} Registadas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-700 mb-6">Desempenho Semanal</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString('pt-AO')} ${CURRENCY}`, 'Vendas']} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Line type="monotone" dataKey="vendas" stroke="#16A34A" strokeWidth={4} dot={{r: 6, fill: '#16A34A', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-primaryBlue p-8 rounded-xl shadow-lg text-white flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black mb-2 uppercase tracking-wider">Acesso Rápido</h2>
            <p className="text-blue-100 mb-8 opacity-80">Gerencie seu negócio de forma eficiente, mesmo sem internet.</p>
          </div>
          <div className="space-y-4">
            <Link to="/sales" className="block w-full bg-white text-primaryBlue text-center py-4 rounded-xl font-black hover:bg-blue-50 transition active:scale-95">
              NOVA VENDA (+)
            </Link>
            <Link to="/stock" className="block w-full bg-blue-600 text-white text-center py-4 rounded-xl font-black border-2 border-blue-400 hover:bg-blue-700 transition active:scale-95">
              VER STOCK
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;