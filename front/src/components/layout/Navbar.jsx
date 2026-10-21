import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Shield } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-[#ffffff] border-b border-[#e5e5e5] px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <h2 className="text-[15px] font-semibold text-[#0a0a0a] tracking-tight">Panel de Control de Inventario</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-[13px] text-[#0a0a0a] bg-[#f5f5f5] px-3 py-1 rounded-[18px] border border-[#e5e5e5]">
          <User size={15} strokeWidth={1.75} className="text-[#737373]" />
          <span className="font-medium text-[#0a0a0a]">{user?.nombreCompleto || user?.username || 'Usuario'}</span>
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
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
};
