import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowLeftRight, Tags, FileText, Boxes } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';

  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Catálogo de Productos', to: '/productos', icon: Package },
    { name: 'Movimientos de Stock', to: '/movimientos', icon: ArrowLeftRight },
    ...(isAdmin ? [{ name: 'Categorías', to: '/categorias', icon: Tags }] : []),
    ...(isAdmin ? [{ name: 'Auditoría y Reportes', to: '/reportes', icon: FileText }] : []),
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen">
      <div className="h-16 flex items-center gap-3 px-6 bg-slate-950 border-b border-slate-800">
        <Boxes size={28} className="text-blue-500" />
        <div>
          <h1 className="text-base font-bold text-white tracking-wide">StockMaster</h1>
          <p className="text-xs text-slate-400">GDS Inventario</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        v1.0.0 &bull; Trabajo Final GDS
      </div>
    </aside>
  );
};
