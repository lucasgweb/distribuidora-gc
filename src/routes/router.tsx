import { createBrowserRouter } from "react-router-dom";
import { PublicRoute } from "./public-route";
import { PrivateRoute } from "./private-route";
import { LoginPage } from "../pages/login.page";
import { HomePage } from "../pages/home.page";
import { RegisterMenuPage } from "../pages/register-menu.page";
import { SaleDetail } from "../pages/sale-detail.page";
import { RegisterSalePage } from "../pages/register-sale.page";
import { DriversListPage } from "../pages/drivers-list.page";
import { RegisterDriverPage } from "../pages/register-driver.page";
import { InventoryListPage } from "../pages/inventory.list.page";
import { InventoryMovementPage } from "../pages/inventory.movement.page";
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
                path: "/register-sale",
                element: <RegisterSalePage />
            },
            {
                path: "/sale-detail",
                element: <SaleDetail />
            },
            {
                path: "/drivers",
                element: <DriversListPage />
            },
            {
                path: "/register-driver",
                element: <RegisterDriverPage />
            },
            {
                path: "/inventory",
                element: <InventoryListPage />
            },
            {
                path: "/inventory-movement",
                element: <InventoryMovementPage />
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