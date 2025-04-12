import { Navigate, Outlet } from 'react-router-dom';
import { getAuthStore } from '../utils/get-auth-store.util';


export function PrivateRoute() {


    const { state } = getAuthStore();

    const token = state?.token;

    console.log('PrivateRoute', token);
    return token ? <Outlet /> : <Navigate to="/login" />;
}