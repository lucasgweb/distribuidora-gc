import { createBrowserRouter } from "react-router-dom";
import { PublicRoute } from "./public-route";
import { PrivateRoute } from "./private-route";
import { LoginPage } from "../pages/login.page";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <PrivateRoute />,
        children: [
            {
                path: "/",
                element: <div>Home</div>
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