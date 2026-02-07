# M&M Librerías — Prototipo Almacén e Inventarios (React)

SPA responsiva (desktop/tablet/móvil) para una papelería escolar en Perú.

## Funcionalidades incluidas
- Login y Registro (demo offline con `localStorage`)
- Gestión de Tiendas (multi-tienda)
- Gestión de Almacenes (por tienda)
- Gestión de Productos
  - Stock mínimo / máximo por producto
  - Precio con moneda por producto
- Movimientos de stock (Ingreso / Salida) por almacén
- Inventario cíclico por almacén (conteo vs sistema) con ajuste automático
- Multi-moneda (moneda base + tipos de cambio configurables)

## Credenciales demo
- **admin@mm.com** / **Admin123!**

## Tecnologías
- React 19 (estable)
- Vite 7 (estable)
- React Router (SPA)

> Nota: este prototipo guarda datos en el navegador (no hay backend).

## Ejecutar
Requiere Node 20+ (recomendado para Vite 7).

```bash
npm install
npm run dev
```

Luego abre la URL que te muestre la consola.

## Estructura
- `src/pages/*` pantallas
- `src/store/*` estado + persistencia en localStorage
- `public/logo.png` logo (para el prototipo)
