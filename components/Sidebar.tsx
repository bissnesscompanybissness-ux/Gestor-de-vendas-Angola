import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Stock + Categorias', path: '/stock' },
    { name: 'Adicionar Produto', path: '/products/new' },
    { name: 'Carrinho de Compras', path: '/cart' },
    { name: 'Área de Vendas', path: '/sales' },
    { name: 'Clientes', path: '/clients' },
    { name: 'Registro Comerciante', path: '/merchant' },
    { name: 'Histórico de Faturas', path: '/invoices' },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white w-64 p-5 shadow-lg z-40 transform 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <h2 className="text-2xl font-bold mb-6 text-primaryBlue">Menu</h2>
        <nav>
          <ul>
            {navLinks.map((link) => (
              <li key={link.path} className="mb-3">
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `block p-3 rounded-lg text-lg hover:bg-primaryGreen hover:text-white transition-colors duration-200
                    ${isActive ? 'bg-primaryBlue text-white' : 'text-textDark'}`
                  }
                  onClick={toggleSidebar}
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
