# Módulo Frontend - Sistema de Inventarios (StockMaster)

Aplicación Single Page Application (SPA) desarrollada en **React + Vite** con estilos mediante **TailwindCSS**.

## Estructura de Carpetas

```text
front/
├── src/
│   ├── api/          # Configuración de Axios con interceptores JWT Bearer
│   ├── components/   # Componentes reutilizables (Badge, Modal, Layout, Sidebar, Navbar)
│   ├── context/      # AuthContext con gestión de sesión y roles
│   ├── pages/        # Vistas principales (Login, Dashboard, Productos, Movimientos, etc.)
│   ├── utils/        # Funciones auxiliares y formateadores
│   ├── App.jsx       # Rutas protegidas y layout principal
│   ├── main.jsx      # Punto de entrada de React
│   └── index.css     # Directivas de Tailwind y estilos base
├── package.json      # Dependencias y scripts
├── tailwind.config.js# Configuración de colores y tokens de diseño
└── vite.config.js    # Configuración de Vite (puerto 5173)
```

## Instalación y Ejecución

```bash
cd front
npm install
npm run dev
```

La aplicación se ejecutará en: `http://localhost:5173`
