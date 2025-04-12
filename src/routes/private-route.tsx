import { Navigate, Outlet } from 'react-router-dom';


export function PrivateRoute() {


    const token = false

    return token ? <Outlet /> : <Navigate to="/login" />;
}