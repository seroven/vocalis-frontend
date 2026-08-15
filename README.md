# Vocalis

Frontend de Vocalis, un entrenador vocal. React + TypeScript + Vite.

## Cómo arrancar

```bash
npm install
cp .env.example .env
npm run dev
```

Vite queda en `http://127.0.0.1:5173` (no uses `localhost`: Spotify no acepta ese Redirect URI) y reenvía `/api` al backend. El backend tiene que estar corriendo.

## Auth con Spotify

- `/login` — botón para ir a Spotify
- `/auth/callback` — Spotify vuelve aquí con `code` y `state`
- `/` — home, solo si hay sesión

La sesión viaja en una cookie httpOnly. El front no guarda tokens de Spotify.

## Organización

El código se agrupa por **módulo** (una feature). El módulo dueño de su página, sus rutas, sus tipos y su conversación con la API.

```
src/
  main.tsx              Bootstrap de React
  App.tsx               AuthProvider + router
  config/               Cliente HTTP (fetch hacia /api, con cookies)
  layouts/              Shell de la app
  routes/               Router y agregación de rutas
  shared/               Contratos transversales
  styles/               CSS global y tokens de color
  theme/                Claro/oscuro y color base
  modules/
    auth/               Login, callback, sesión
    home/               Pantalla de entrada ya logueado
```

| Carpeta | Para qué |
|---|---|
| `config/` | Cómo se llama al backend |
| `layouts/` | Estructura visual compartida |
| `routes/` | Crea el router y junta las rutas de cada módulo |
| `shared/` | Cosas transversales (`ApiResponse`) |
| `styles/` | Estilos globales |
| `modules/` | Una carpeta por feature |
| `modules/<nombre>/services/` | Clases que hablan con la API |
| `modules/<nombre>/interfaces/` | Tipos de ese dominio |

## Cómo se conectan las piezas

1. `routes/routes.tsx` monta el layout y hace spread de las rutas de cada módulo.
2. Cada módulo exporta su `routes.tsx`.
3. La página usa un `*Service.ts` para pedir datos.
4. El service usa `config/api.ts` y tipa la respuesta con `ApiResponse<T>`.

## Cómo agregar un módulo

1. Crea `src/modules/<nombre>/` con `*Page.tsx`, `routes.tsx` y, si habla con la API, `services/` e `interfaces/`.
2. Exporta las rutas del módulo.
3. Regístralas en `src/routes/routes.tsx`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Sirve el build |
| `npm run lint` | ESLint |
