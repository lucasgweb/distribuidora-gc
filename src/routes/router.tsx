import { createBrowserRouter } from "react-router-dom";
import { PublicRoute } from "./public-route";
import { PrivateRoute } from "./private-route";
import { LoginPage } from "../pages/login.page";
import { HomePage } from "../pages/home.page";
import { RegisterMenuPage } from "../pages/register-menu.page";
import { RegisterSalePage } from "../pages/register-sale.page";
import { DriversListPage } from "../pages/drivers-list.page";
import { RegisterDriverPage } from "../pages/register-driver.page";
import { InventoryListPage } from "../pages/inventory.list.page";
import { InventoryMovementPage } from "../pages/inventory.movement.page";
import { ProductListPage } from "../pages/product-list.page";
import { ProductDetailsPage } from "../pages/product-details.page";
import { ClientListPage } from "../pages/client-list.page";
import { ClientFormPage } from "../pages/client-form.page";
import { SalesListPage } from "../pages/sales-list.page";
import { SaleFinished } from "../pages/sale-finished.page";
import { SaleDetail } from "../pages/sale-detail.page";
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
                path: "/sale-finished/:id",
                element: <SaleFinished />
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
            {
                path: "/products",
                element: <ProductListPage />
            },
            {
                path: "/products/:id",
                element: <ProductDetailsPage />
            },
            {
                path: "/products/new",
                element: <ProductDetailsPage />
            },
            {
                path: "/clients",
                element: <ClientListPage />
            },
            {
                path: "/clients/:id",
                element: <ClientFormPage />
            },
            {
                path: "/clients/new",
                element: <ClientFormPage />
            },
            {
                path: "/sales-list",
                element: <SalesListPage />
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
    },

    {
        path: "/sale-detail/:id",
        element: <SaleDetail />
    },
]);