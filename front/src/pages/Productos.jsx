import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Search, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { StockBadge } from '../components/common/Badge';
import { ProductoModal } from '../components/productos/ProductoModal';
import { ConfirmDeleteModal } from '../components/productos/ConfirmDeleteModal';
import { useAuth } from '../context/AuthContext';

export const Productos = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');

  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Estados para baja lógica (HU-04)
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchProductos();
  }, [page, search]);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/productos', {
        params: { page, size: 10, search: search || undefined }
      });
      setProductos(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching productos', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setProductoAEditar(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (producto) => {
    setProductoAEditar(producto);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductoAEditar(null);
  };

  const handleOpenDelete = (producto) => {
    setProductoAEliminar(producto);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (deleteLoading) return;
    setIsDeleteModalOpen(false);
    setProductoAEliminar(null);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!productoAEliminar) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.delete(`/productos/${productoAEliminar.id}`);
      setFeedbackMessage(`Producto "${productoAEliminar.nombre}" (SKU: ${productoAEliminar.sku}) dado de baja con éxito.`);
      setIsDeleteModalOpen(false);
      setProductoAEliminar(null);
      fetchProductos();
      setTimeout(() => {
        setFeedbackMessage('');
      }, 4000);
    } catch (err) {
      console.error('Error al dar de baja el producto', err);
      const msg = err.response?.data?.message || 'Error al procesar la baja lógica del producto.';
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleProductSaved = (producto, isEdit) => {
    if (isEdit) {
      setFeedbackMessage(`Producto "${producto.nombre}" (SKU: ${producto.sku}) actualizado con éxito.`);
    } else {
      setFeedbackMessage(`Producto "${producto.nombre}" (SKU: ${producto.sku}) registrado con éxito.`);
    }
    fetchProductos();
    setTimeout(() => {
      setFeedbackMessage('');
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Banner de Feedback Exitoso */}
      {feedbackMessage && (
        <div className="p-4 bg-[#ffffff] border border-[#e5e5e5] rounded-[24px] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 size={18} strokeWidth={2} className="text-[#0a0a0a]" />
          <span className="text-[14px] text-[#0a0a0a] font-medium">{feedbackMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[30px] font-semibold text-[#0a0a0a] tracking-tight">Catálogo de Productos</h1>
          <p className="text-[14px] text-[#737373]">Gestión de artículos, precios y niveles de stock.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-[#0a0a0a] hover:bg-[#171717] text-[#fafafa] px-4 py-2 rounded-[18px] text-[14px] font-medium flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus size={16} strokeWidth={1.75} />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Barra de Búsqueda */}
        <div className="p-4 border-b border-[#e5e5e5] flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search size={16} strokeWidth={1.75} className="absolute left-3.5 top-2.5 text-[#737373]" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o categoría..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-10 pr-4 py-2 bg-[#f5f5f5] text-[#0a0a0a] placeholder-[#737373] border border-transparent focus:border-[#e5e5e5] rounded-[18px] text-[14px] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#fafafa] text-[12px] uppercase text-[#737373] font-medium">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-right">Precio Unit.</th>
                <th className="px-4 py-3 text-right">Stock Actual</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-[#737373] text-[14px]">Cargando catálogo...</td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-[#737373] text-[14px]">No se encontraron productos.</td>
                </tr>
              ) : (
                productos.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-3 font-mono text-[12px] text-[#737373]">{prod.sku}</td>
                    <td className="px-4 py-3 font-medium text-[#0a0a0a]">{prod.nombre}</td>
                    <td className="px-4 py-3 text-[#737373]">{prod.categoria?.nombre || '-'}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-mono">${Number(prod.precioUnitario).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">{prod.stockActual}</td>
                    <td className="px-4 py-3 text-center">
                      <StockBadge stockActual={prod.stockActual} stockMinimo={prod.stockMinimo} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 text-[#737373] hover:text-[#0a0a0a] rounded-[18px] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                          title="Editar producto"
                        >
                          <Edit2 size={15} strokeWidth={1.75} />
                        </button>
                        {isAdmin ? (
                          <button
                            onClick={() => handleOpenDelete(prod)}
                            className="p-1.5 text-[#737373] hover:text-[#e7000b] rounded-[18px] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                            title="Dar de baja producto"
                          >
                            <Trash2 size={15} strokeWidth={1.75} />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="p-1.5 text-[#737373] opacity-30 cursor-not-allowed rounded-[18px]"
                            title="Solo los administradores pueden dar de baja productos"
                          >
                            <Trash2 size={15} strokeWidth={1.75} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="p-4 border-t border-[#e5e5e5] flex items-center justify-between text-[13px] text-[#737373]">
          <span>Página {page + 1} de {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              className="px-3 py-1 bg-transparent hover:bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] rounded-[18px] disabled:opacity-40 transition-colors cursor-pointer"
            >
              Anterior
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-transparent hover:bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] rounded-[18px] disabled:opacity-40 transition-colors cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Alta y Edición de Producto (HU-02 y HU-03) */}
      <ProductoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleProductSaved}
        productoAEditar={productoAEditar}
      />

      {/* Modal de Baja Lógica (HU-04) */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        producto={productoAEliminar}
        loading={deleteLoading}
        error={deleteError}
      />
    </div>
  );
};
