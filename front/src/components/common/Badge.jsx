import React from 'react';

export const Badge = ({ children, variant = 'soft' }) => {
  const variants = {
    solid: 'bg-[#171717] text-[#fafafa]',
    soft: 'bg-[#f5f5f5] text-[#171717]',
    outline: 'bg-transparent text-[#0a0a0a] border border-[#e5e5e5]',
    destructive: 'bg-transparent text-[#e7000b] border border-[#e5e5e5]',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[18px] text-[12px] font-medium tracking-tight ${variants[variant] || variants.soft}`}>
      {children}
    </span>
  );
};

export const StockBadge = ({ stockActual, stockMinimo }) => {
  if (stockActual <= 0) {
    return <Badge variant="destructive">Sin Stock (0)</Badge>;
  }
  if (stockActual <= stockMinimo) {
    return <Badge variant="solid">Crítico ({stockActual})</Badge>;
  }
  return <Badge variant="outline">Stock: {stockActual}</Badge>;
};
