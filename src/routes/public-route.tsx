
import { Navigate, Outlet } from 'react-router-dom';

export function PublicRoute() {

    const token = false
    return !token ? <Outlet /> : <Navigate to="/" />;
}