
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthStore } from '../utils/get-auth-store.util';

export function PublicRoute() {
    const { state } = getAuthStore();

    const token = state?.token;

    console.log('PublicRoute', token);
    return !token ? <Outlet /> : <Navigate to="/" />;
}