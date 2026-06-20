# simple-sipoc

Herramienta web para crear diagramas SIPOC de forma simple, con enfoque en informacion y flujo rapido.

## Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Componentes estilo shadcn/ui
- Zustand para estado
- fast-xml-parser para XML

## Estado actual (primer incremento)

- Editor SIPOC base en espanol.
- Secciones principales: Proveedores, Entradas, Proceso, Salidas y Clientes.
- Anidamiento de SIPOC dentro de procesos (hasta 3 niveles).
- Guardar diagrama en XML.
- Cargar XML para continuar edicion.
- Autosave local en navegador.

## Exportaciones disponibles

- SVG
- PNG
- PDF

Las exportaciones se realizan desde la vista actual del editor.

## Ejecutar local

1. Instalar dependencias:

	pnpm install

2. Iniciar entorno de desarrollo:

	pnpm dev

3. Abrir en navegador:

	http://localhost:3000

## Calidad

- Lint: pnpm lint
- Tipos: pnpm typecheck
- Build: pnpm build

## Siguientes hitos

- Exportacion PDF, SVG y PNG.
- Mejoras de UX para edicion mas rapida.
- Pruebas automatizadas de XML y anidamiento.
