# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Local development with AOM backend

This frontend uses a Vite environment variable to configure the API base URL.

1. Copy the env example:
   ```bash
   cp frontend/.env.example frontend/.env
   ```
2. If the backend runs locally on port `8000`, no changes are needed. Otherwise update `VITE_API_BASE_URL` in `frontend/.env`.
3. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Backend requirements

The frontend expects the backend API at `http://localhost:8000/api/v1/transactions` and uses these endpoints:
- `POST /receive`
- `POST /send`
- `GET /balance/{account_number}`
- `GET /history/{account_number}`

If you have not already configured the backend, copy and update the root `.env.example` values for `SQUAD_SECRET_KEY`, `SQUAD_BASE_URL`, `AI_ENGINE_URL`, and `DATABASE_URL`.
