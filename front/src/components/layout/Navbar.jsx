import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Shield } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-slate-800">Panel de Control de Inventario</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
          <User size={16} className="text-slate-500" />
          <span className="font-medium text-slate-800">{user?.nombreCompleto || user?.username || 'Usuario'}</span>
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold uppercase">
            <Shield size={12} />
            {user?.rol || 'OPERADOR'}
          </span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
          title="Cerrar sesión"
        >
          <LogOut size={16} />
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
};
