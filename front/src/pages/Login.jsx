import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Boxes, Lock, User, AlertCircle } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      const { user, token } = response.data;
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-8 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#fafafa] border border-[#e5e5e5] text-[#0a0a0a] rounded-[18px] flex items-center justify-center mx-auto mb-3">
            <Boxes size={24} strokeWidth={1.75} />
          </div>
          <h2 className="text-[24px] font-semibold text-[#0a0a0a] tracking-tight">StockMaster</h2>
          <p className="text-[13px] text-[#737373] mt-1">Sistema de Gestión y Control de Inventarios</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#ffffff] border border-[#e5e5e5] text-[#e7000b] text-[13px] rounded-[18px] flex items-center gap-2">
            <AlertCircle size={16} strokeWidth={1.75} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium uppercase tracking-wider text-[#737373] mb-1.5">Usuario</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373]">
                <User size={16} strokeWidth={1.75} />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#f5f5f5] text-[#0a0a0a] placeholder-[#737373] border border-transparent focus:border-[#e5e5e5] rounded-[18px] text-[14px] focus:outline-none transition-colors"
                placeholder="Nombre de usuario"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium uppercase tracking-wider text-[#737373] mb-1.5">Contraseña</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373]">
                <Lock size={16} strokeWidth={1.75} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#f5f5f5] text-[#0a0a0a] placeholder-[#737373] border border-transparent focus:border-[#e5e5e5] rounded-[18px] text-[14px] focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0a0a0a] hover:bg-[#171717] text-[#fafafa] font-medium py-2 rounded-[18px] text-[14px] transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};
