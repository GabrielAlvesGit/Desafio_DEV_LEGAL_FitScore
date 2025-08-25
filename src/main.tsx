import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// 1 - Configuração de router
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

/* ============ Pages =========== */
import Home from "./page-template/Home/Home.tsx"
import Dashboard from "./page-template/Dashboard/Dashboard.tsx"
import Erro from "./page-template/erro/Erro.tsx"

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Home />,
//   },
//   {
//     path: "login",
//     element: <Login />,
//   },
// ]);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // 3 - Página de Erro
    errorElement: <Erro />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "Dashboard",
        element: <Dashboard />,
      },
       // 7 - navigate para páginas não existentes
      {
        path: "oldcontact",
        element: <Navigate to="/" />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
