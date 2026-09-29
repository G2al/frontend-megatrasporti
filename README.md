# Mega Trasporti — Frontend

Web app mobile-first e installabile (PWA) in Next.js 16 + React 19 che usa le API REST Laravel (Sanctum, token Bearer) del backend esistente.

## Avvio

```bash
npm install
npm run dev            # se Turbopack/SWC è bloccato: npm run dev -- --webpack
npm run build && npm start
npm run lint
```

Il backend Laravel deve essere raggiungibile all'indirizzo di `NEXT_PUBLIC_API_BASE_URL` e accettare l'origine del frontend (CORS).

## Variabili d'ambiente (`.env.local`)

| Variabile | Esempio | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://127.0.0.1:8000/api` | Base delle API |
| `NEXT_PUBLIC_BRAND_NAME` | `Mega Trasporti` | Nome del brand |
| `NEXT_PUBLIC_BRAND_PRIMARY` | `#1A2A9C` | Colore primario (tema, manifest, theme-color) |

## Struttura

```
src/app/(auth)      login, registrati (pubbliche)
src/app/(app)       rifornimenti, manutenzioni, documenti, viaggi (protette)
src/app/manifest.ts manifest PWA
src/components      layout/, shared/, movements/, maintenances/, trips/, documents/, ui/ (shadcn)
src/config/brand.ts nome, colore e percorsi degli asset
src/lib             api.ts (fetch tipizzato), auth.ts, format.ts, image.ts (compressione), form.ts, search.ts
src/hooks           use-auth, use-data (TanStack Query), use-last-vehicle
public/sw.js        service worker minimo (nessuna cache dei dati)
```

## Sostituire i loghi

Copia i file in `public/brand/` mantenendo i nomi (se mancano, l'app mostra il nome testuale):

- `logo.png` — logo a colori (login e registrazione)
- `logo-white.png` — logo bianco (header blu)
- `pwa-192.png`, `pwa-512.png` — icone PWA (anche maskable)

L'icona `public/favicon.ico` è quella del sito. I percorsi sono centralizzati in `src/config/brand.ts`.

## Note

- Token in `localStorage` (`mega_token`, `mega_user`), oppure in `sessionStorage` se "Ricordami" è disattivo.
- Il service worker si registra solo in produzione (`npm run build && npm start`).
- Foto e immagini vengono ridimensionate (max 1600px) e ricompresse in JPEG prima dell'upload; PDF e altri file non vengono modificati. Limite 16 MB.
