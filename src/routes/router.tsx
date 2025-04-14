import { createBrowserRouter } from "react-router-dom";
import { PublicRoute } from "./public-route";
import { PrivateRoute } from "./private-route";
import { LoginPage } from "../pages/login.page";
import { HomePage } from "../pages/home.page";
import { RegisterMenuPage } from "../pages/register-menu.page";
import { SaleDetailPage } from "../pages/sale-detail.page";
export const router = createBrowserRouter([
    {
        path: "/",
        element: <PrivateRoute />,
        children: [

            {
                path: "/",
                element: <HomePage />
            },
            {
                path: "/register-menu",
                element: <RegisterMenuPage />
            },
            {
                path: "/sale-detail",
                element: <SaleDetailPage />
            },
        ]
    },
    {
        path: "/",
        element: <PublicRoute />,
        children: [{
            path: "/login",
            element: <LoginPage />
        },
        ]
    }
]);