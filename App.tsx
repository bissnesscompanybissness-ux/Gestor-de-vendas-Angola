import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StockManager from './components/StockManager';
import ProductForm from './components/ProductForm';
import Cart from './components/Cart';
import SalesArea from './components/SalesArea';
import ClientManager from './components/ClientManager';
import MerchantRegistration from './components/MerchantRegistration';
import InvoiceHistory from './components/InvoiceHistory';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Header toggleSidebar={toggleSidebar} />
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 lg:ml-64 transition-all duration-300">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stock" element={<StockManager />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/sales" element={<SalesArea />} />
            <Route path="/clients" element={<ClientManager />} />
            <Route path="/merchant" element={<MerchantRegistration />} />
            <Route path="/invoices" element={<InvoiceHistory />} />
            {/* Catch-all route for unmatched paths */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
