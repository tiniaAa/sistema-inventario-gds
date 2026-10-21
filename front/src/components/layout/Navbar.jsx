import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Boxes,
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Tags,
  FileSpreadsheet,
  User,
  Shield,
  LogOut,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';

  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Catálogo', to: '/productos', icon: Package },
    { name: 'Movimientos', to: '/movimientos', icon: ArrowLeftRight },
    ...(isAdmin ? [{ name: 'Categorías', to: '/categorias', icon: Tags }] : []),
    ...(isAdmin ? [{ name: 'Reportes', to: '/reportes', icon: FileSpreadsheet }] : []),
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#ffffff] border-b border-[#e5e5e5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo y Marca */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-[10px] bg-[#0a0a0a] text-[#fafafa] flex items-center justify-center">
              <Boxes size={20} strokeWidth={1.75} />
            </div>
            <div>
              <span className="text-[15px] font-semibold text-[#0a0a0a] tracking-tight block leading-tight">StockMaster</span>
              <span className="text-[11px] text-[#737373] tracking-wide uppercase font-medium">GDS Almacén</span>
            </div>
          </div>

          {/* Menú de Navegación Superior (Pills Segmentadas) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#f5f5f5] p-1 rounded-[18px] border border-[#e5e5e5]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-1.5 rounded-[18px] text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-[#0a0a0a] text-[#fafafa] shadow-sm'
                        : 'text-[#737373] hover:text-[#0a0a0a] hover:bg-[#ffffff]'
                    }`
                  }
                >
                  <Icon size={15} strokeWidth={1.75} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Perfil y Acciones */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-[13px] text-[#0a0a0a] bg-[#f5f5f5] px-3 py-1 rounded-[18px] border border-[#e5e5e5]">
              <User size={15} strokeWidth={1.75} className="text-[#737373]" />
              <span className="font-medium hidden sm:inline">{user?.nombreCompleto || user?.username || 'Usuario'}</span>
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-[18px] bg-[#171717] text-[#fafafa] font-medium uppercase tracking-tight">
                <Shield size={11} strokeWidth={1.75} />
                {user?.rol || 'OPERADOR'}
              </span>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1 text-[13px] font-medium text-[#737373] hover:text-[#e7000b] hover:bg-[#f5f5f5] px-3 py-1.5 rounded-[18px] transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={15} strokeWidth={1.75} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Barra de Navegación Móvil (visible en pantallas pequeñas) */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-[#e5e5e5] scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-[18px] text-[12px] font-medium whitespace-nowrap ${
                    isActive
                      ? 'bg-[#0a0a0a] text-[#fafafa]'
                      : 'text-[#737373] bg-[#f5f5f5]'
                  }`
                }
              >
                <Icon size={14} strokeWidth={1.75} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </header>
  );
};
