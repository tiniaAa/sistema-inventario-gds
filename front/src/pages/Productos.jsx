import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Search, Edit2, Trash2, X, AlertCircle, CheckCircle2, Loader2, PackagePlus } from 'lucide-react';
import { StockBadge } from '../components/common/Badge';

export const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Estados para Modal de Alta (HU-02)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const initialFormState = {
    sku: '',
    nombre: '',
    descripcion: '',
    categoriaId: '',
    precioUnitario: '',
    stockInicial: '0',
    stockMinimo: '5'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchProductos();
  }, [page, search]);

  useEffect(() => {
    fetchCategorias();
  }, []);

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

  const fetchCategorias = async () => {
    setLoadingCategorias(true);
    try {
      const res = await api.get('/categorias');
      setCategorias(res.data || []);
    } catch (err) {
      console.error('Error fetching categorias', err);
    } finally {
      setLoadingCategorias(false);
    }
  };

  const handleOpenModal = () => {
    setFormData(initialFormState);
    setFormErrors({});
    setSubmitError('');
    setIsModalOpen(true);
    if (categorias.length === 0) {
      fetchCategorias();
    }
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setFormData(initialFormState);
    setFormErrors({});
    setSubmitError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.sku.trim()) {
      errors.sku = 'El código SKU es obligatorio.';
    } else if (formData.sku.trim().length > 50) {
      errors.sku = 'El SKU no puede exceder los 50 caracteres.';
    }

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre del producto es obligatorio.';
    } else if (formData.nombre.trim().length > 100) {
      errors.nombre = 'El nombre no puede exceder los 100 caracteres.';
    }

    if (!formData.categoriaId) {
      errors.categoriaId = 'Debe seleccionar una categoría.';
    }

    if (formData.precioUnitario === '' || formData.precioUnitario === null) {
      errors.precioUnitario = 'El precio unitario es obligatorio.';
    } else if (isNaN(formData.precioUnitario) || parseFloat(formData.precioUnitario) < 0) {
      errors.precioUnitario = 'El precio unitario debe ser mayor o igual a 0.';
    }

    if (formData.stockInicial !== '') {
      const parsedStock = parseInt(formData.stockInicial, 10);
      if (isNaN(parsedStock) || parsedStock < 0) {
        errors.stockInicial = 'El stock inicial no puede ser negativo.';
      }
    }

    if (formData.stockMinimo === '' || formData.stockMinimo === null) {
      errors.stockMinimo = 'El stock mínimo es obligatorio.';
    } else {
      const parsedMin = parseInt(formData.stockMinimo, 10);
      if (isNaN(parsedMin) || parsedMin < 0) {
        errors.stockMinimo = 'El stock mínimo no puede ser negativo.';
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        sku: formData.sku.trim(),
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        categoriaId: Number(formData.categoriaId),
        precioUnitario: parseFloat(formData.precioUnitario),
        stockInicial: formData.stockInicial !== '' ? parseInt(formData.stockInicial, 10) : 0,
        stockMinimo: formData.stockMinimo !== '' ? parseInt(formData.stockMinimo, 10) : 5
      };

      const res = await api.post('/productos', payload);

      setSuccessMessage(`Producto "${res.data.nombre}" registrado exitosamente con SKU ${res.data.sku}.`);
      handleCloseModal();
      setPage(0);
      fetchProductos();

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      console.error('Error al registrar producto:', err);
      if (err.response?.data?.fieldErrors) {
        setFormErrors(err.response.data.fieldErrors);
      } else if (err.response?.data?.message) {
        setSubmitError(err.response.data.message);
      } else {
        setSubmitError('Ocurrió un error inesperado al intentar registrar el producto.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notificación de Éxito */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center justify-between text-sm shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-emerald-500 hover:text-emerald-700 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Encabezado y Botón de Acción */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catálogo de Productos</h1>
          <p className="text-sm text-slate-500">Gestión de artículos, precios y niveles de stock.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={16} />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Barra de Búsqueda y Filtros */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500 font-semibold">
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
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500 text-sm">Cargando catálogo...</td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500 text-sm">No se encontraron productos.</td>
                </tr>
              ) : (
                productos.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{prod.sku}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{prod.nombre}</td>
                    <td className="px-4 py-3 text-slate-600">{prod.categoria?.nombre || '-'}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-mono">${Number(prod.precioUnitario).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">{prod.stockActual}</td>
                    <td className="px-4 py-3 text-center">
                      <StockBadge stockActual={prod.stockActual} stockMinimo={prod.stockMinimo} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-slate-400 hover:text-blue-600 transition-colors" title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button className="text-slate-400 hover:text-red-600 transition-colors" title="Baja lógica">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
          <span>Página {page + 1} de {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              className="px-3 py-1 border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Alta de Producto (HU-02) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-scale-in">
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <PackagePlus size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Alta de Nuevo Producto</h2>
                  <p className="text-xs text-slate-500">Ingrese los datos para incorporar el artículo al catálogo.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={submitting}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SKU */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    placeholder="Ej: HER-001"
                    value={formData.sku}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      formErrors.sku ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formErrors.sku && <p className="text-xs text-red-600 mt-1">{formErrors.sku}</p>}
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoriaId"
                    value={formData.categoriaId}
                    onChange={handleChange}
                    disabled={loadingCategorias}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      formErrors.categoriaId ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
                  >
                    <option value="">
                      {loadingCategorias ? 'Cargando categorías...' : '-- Seleccione una categoría --'}
                    </option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  {formErrors.categoriaId && <p className="text-xs text-red-600 mt-1">{formErrors.categoriaId}</p>}
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Producto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Ej: Taladro Percutor 750W Bosch"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    formErrors.nombre ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {formErrors.nombre && <p className="text-xs text-red-600 mt-1">{formErrors.nombre}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Precio Unitario */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Precio Unitario ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="precioUnitario"
                    placeholder="0.00"
                    value={formData.precioUnitario}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      formErrors.precioUnitario ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formErrors.precioUnitario && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.precioUnitario}</p>
                  )}
                </div>

                {/* Stock Inicial */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    name="stockInicial"
                    placeholder="0"
                    value={formData.stockInicial}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      formErrors.stockInicial ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formErrors.stockInicial && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.stockInicial}</p>
                  )}
                </div>

                {/* Stock Mínimo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Stock Mínimo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    name="stockMinimo"
                    placeholder="5"
                    value={formData.stockMinimo}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      formErrors.stockMinimo ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formErrors.stockMinimo && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.stockMinimo}</p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  name="descripcion"
                  rows="2"
                  placeholder="Detalles adicionales, modelo, especificaciones técnicas o ubicación en depósito..."
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Producto'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
