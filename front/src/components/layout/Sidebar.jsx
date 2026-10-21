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
    <aside className="w-64 bg-[#fafafa] border-r border-[#e5e5e5] flex flex-col shrink-0 min-h-screen">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-[#e5e5e5]">
        <Boxes size={24} strokeWidth={1.75} className="text-[#0a0a0a]" />
        <div>
          <h1 className="text-[15px] font-semibold text-[#0a0a0a] tracking-tight">StockMaster</h1>
          <p className="text-[12px] text-[#737373]">GDS Inventario</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2 rounded-[18px] text-[14px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#0a0a0a] text-[#fafafa]'
                    : 'text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]'
                }`
              }
            >
              <Icon size={17} strokeWidth={1.75} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#e5e5e5] text-[12px] text-[#737373] text-center">
        v1.0.0 &bull; Trabajo Final GDS
      </div>
    </aside>
  );
};
