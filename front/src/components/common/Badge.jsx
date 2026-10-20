import React from 'react';

export const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    optimal: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    default: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
};

export const StockBadge = ({ stockActual, stockMinimo }) => {
  if (stockActual <= 0) {
    return <Badge variant="danger">Sin Stock (0)</Badge>;
  }
  if (stockActual <= stockMinimo) {
    return <Badge variant="warning">Crítico ({stockActual})</Badge>;
  }
  return <Badge variant="optimal">Óptimo ({stockActual})</Badge>;
};
