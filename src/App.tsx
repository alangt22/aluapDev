import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/layout";
import { Home } from "./pages/home";
import { Dashboard } from "./pages/dashboard";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { Private } from "./routes/Private";

import { ResetPassword } from "./pages/resetPassword";
import { CardDetail } from "./pages/cardDetail";
import { ResumoFinanceiro } from "./pages/resumoFinanceiro";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/dashboard",
        element: (
          <Private>
            <Dashboard />
          </Private>
        ),
      },
      {
        path: "/card/:id",
        element: (
          <Private>
            <CardDetail />
          </Private>
        ),
      },
      {
        path: "/resumo",
        element: (
          <Private>
            <ResumoFinanceiro />
          </Private>
        ),
      },
    ],
  },
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
]);

export { router };
