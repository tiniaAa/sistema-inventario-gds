import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { Plus, Search, Edit2, Trash2, RotateCcw, CheckCircle2, Tag, AlertCircle } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { CategoriaModal } from '../components/categorias/CategoriaModal';
import { ConfirmCategoriaModal } from '../components/categorias/ConfirmCategoriaModal';

export const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas'); // 'todas' | 'activas' | 'inactivas'

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaAEditar, setCategoriaAEditar] = useState(null);

  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Notificaciones
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // Pasamos incluirInactivas=true para la vista de administración
      const res = await api.get('/categorias', {
        params: { incluirInactivas: true }
      });
      setCategorias(res.data || []);
    } catch (e) {
      console.error('Error al cargar categorías', e);
      setErrorMessage('No se pudieron cargar las categorías del servidor.');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage('');
    }, 4000);
  };

  const handleOpenCreate = () => {
    setCategoriaAEditar(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setCategoriaAEditar(cat);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCategoriaAEditar(null);
  };

  const handleCategoriaSaved = (cat, isEdit) => {
    showFeedback(
      isEdit
        ? `Categoría "${cat.nombre}" actualizada con éxito.`
        : `Categoría "${cat.nombre}" creada con éxito.`
    );
    fetchCategorias();
  };

  const handleOpenDelete = (cat) => {
    setCategoriaAEliminar(cat);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (deleteLoading) return;
    setIsDeleteModalOpen(false);
    setCategoriaAEliminar(null);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!categoriaAEliminar) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.delete(`/categorias/${categoriaAEliminar.id}`);
      showFeedback(`Categoría "${categoriaAEliminar.nombre}" dada de baja correctamente.`);
      setIsDeleteModalOpen(false);
      setCategoriaAEliminar(null);
      fetchCategorias();
    } catch (err) {
      console.error('Error al deshabilitar categoría', err);
      const msg =
        err.response?.data?.message ||
        'Ocurrió un error al intentar deshabilitar la categoría.';
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReactivar = async (cat) => {
    try {
      await api.patch(`/categorias/${cat.id}/reactivar`);
      showFeedback(`Categoría "${cat.nombre}" reactivada con éxito.`);
      fetchCategorias();
    } catch (err) {
      console.error('Error al reactivar categoría', err);
      const msg =
        err.response?.data?.message ||
        'No se pudo reactivar la categoría seleccionada.';
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // Filtrado reactivo en cliente (búsqueda y estado)
  const categoriasFiltradas = useMemo(() => {
    return categorias.filter((c) => {
      // Filtro de estado
      if (filtroEstado === 'activas' && !c.activo) return false;
      if (filtroEstado === 'inactivas' && c.activo) return false;

      // Filtro de texto
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchNombre = c.nombre?.toLowerCase().includes(query);
        const matchDesc = c.descripcion?.toLowerCase().includes(query);
        return matchNombre || matchDesc;
      }
      return true;
    });
  }, [categorias, search, filtroEstado]);

  const conteos = useMemo(() => {
    const total = categorias.length;
    const activas = categorias.filter((c) => c.activo).length;
    const inactivas = total - activas;
    return { total, activas, inactivas };
  }, [categorias]);

  return (
    <div className="space-y-6">
      {/* Notificación de éxito */}
      {feedbackMessage && (
        <div className="p-4 bg-[#ffffff] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] rounded-[18px] flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[18px] bg-[#f5f5f5] flex items-center justify-center text-[#0a0a0a]">
              <CheckCircle2 size={16} strokeWidth={2} />
            </div>
            <p className="text-[14px] text-[#0a0a0a] font-medium">{feedbackMessage}</p>
          </div>
          <button
            onClick={() => setFeedbackMessage('')}
            className="text-[12px] text-[#737373] hover:text-[#0a0a0a] cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Notificación de error */}
      {errorMessage && (
        <div className="p-4 bg-[#ffffff] border border-[#e7000b]/20 rounded-[18px] flex items-center justify-between text-[#e7000b] animate-fadeIn">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} strokeWidth={2} />
            <p className="text-[14px] font-medium">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-[12px] text-[#737373] hover:text-[#0a0a0a] cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-semibold text-[#0a0a0a] tracking-tight">
            Categorías de Productos
          </h1>
          <p className="text-[14px] text-[#737373]">
            Clasificación y segmentación de artículos para organizar el inventario en almacén.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-[#0a0a0a] hover:bg-[#171717] text-[#fafafa] px-4 py-2.5 rounded-[18px] text-[14px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} strokeWidth={1.75} />
          Nueva Categoría
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]"
            size={16}
            strokeWidth={1.75}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#f5f5f5] text-[#0a0a0a] placeholder-[#737373] text-[14px] pl-10 pr-4 py-2 rounded-[18px] border-none focus:outline-none focus:ring-1 focus:ring-[#e5e5e5] transition-all"
          />
        </div>

        {/* Píldoras de Filtro por Estado */}
        <div className="flex items-center gap-1.5 p-1 bg-[#ffffff] border border-[#e5e5e5] rounded-[18px]">
          <button
            type="button"
            onClick={() => setFiltroEstado('todas')}
            className={`px-3 py-1 text-[13px] rounded-[18px] font-medium transition-colors cursor-pointer ${
              filtroEstado === 'todas'
                ? 'bg-[#0a0a0a] text-[#fafafa]'
                : 'text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]'
            }`}
          >
            Todas ({conteos.total})
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado('activas')}
            className={`px-3 py-1 text-[13px] rounded-[18px] font-medium transition-colors cursor-pointer ${
              filtroEstado === 'activas'
                ? 'bg-[#0a0a0a] text-[#fafafa]'
                : 'text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]'
            }`}
          >
            Activas ({conteos.activas})
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado('inactivas')}
            className={`px-3 py-1 text-[13px] rounded-[18px] font-medium transition-colors cursor-pointer ${
              filtroEstado === 'inactivas'
                ? 'bg-[#0a0a0a] text-[#fafafa]'
                : 'text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]'
            }`}
          >
            Inactivas ({conteos.inactivas})
          </button>
        </div>
      </div>

      {/* Tabla de Categorías */}
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#fafafa] text-[12px] uppercase text-[#737373] font-medium border-b border-[#e5e5e5]">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Nombre</th>
                <th className="px-5 py-3.5">Descripción</th>
                <th className="px-5 py-3.5 text-center">Productos Vinculados</th>
                <th className="px-5 py-3.5 text-center">Estado</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-[#737373]">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-[#737373] border-t-transparent animate-spin" />
                      <span>Cargando categorías...</span>
                    </div>
                  </td>
                </tr>
              ) : categoriasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-[#737373]">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-[18px] bg-[#f5f5f5] flex items-center justify-center mx-auto text-[#737373]">
                        <Tag size={20} strokeWidth={1.5} />
                      </div>
                      <p className="text-[14px] font-medium text-[#0a0a0a]">
                        No se encontraron categorías
                      </p>
                      <p className="text-[13px] text-[#737373]">
                        {search
                          ? 'Pruebe ajustando el término de búsqueda o cambiando el filtro.'
                          : 'Comience registrando una nueva categoría con el botón superior.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                categoriasFiltradas.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-[#fafafa] transition-colors ${
                      !c.activo ? 'opacity-70 bg-[#fafafa]/50' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5 font-mono text-[12px] text-[#737373]">
                      #{c.id}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#0a0a0a]">
                      <div className="flex items-center gap-2">
                        <span>{c.nombre}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#737373] max-w-xs truncate">
                      {c.descripcion || <span className="italic text-[#737373]/60">Sin descripción</span>}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-[12px] font-medium bg-[#f5f5f5] text-[#171717] tabular-nums">
                        {c.cantidadProductos || 0} ítems
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge variant={c.activo ? 'outline' : 'destructive'}>
                        {c.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          title="Editar categoría"
                          className="p-1.5 text-[#737373] hover:text-[#0a0a0a] rounded-[18px] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                        >
                          <Edit2 size={16} strokeWidth={1.75} />
                        </button>

                        {/* Desactivar o Reactivar */}
                        {c.activo ? (
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(c)}
                            title="Deshabilitar categoría"
                            className="p-1.5 text-[#737373] hover:text-[#e7000b] rounded-[18px] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} strokeWidth={1.75} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleReactivar(c)}
                            title="Reactivar categoría"
                            className="p-1.5 text-[#737373] hover:text-[#0a0a0a] rounded-[18px] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                          >
                            <RotateCcw size={16} strokeWidth={1.75} />
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
      </div>

      {/* Modal de Alta y Edición */}
      <CategoriaModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        categoriaAEditar={categoriaAEditar}
        onCategoriaSaved={handleCategoriaSaved}
      />

      {/* Modal de Confirmación de Baja Lógica */}
      <ConfirmCategoriaModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        categoria={categoriaAEliminar}
        loading={deleteLoading}
        error={deleteError}
      />
    </div>
  );
};
