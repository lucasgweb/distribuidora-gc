import { AuthStore } from "../stores/use-auth.store";




export function getAuthStore() : {state: AuthStore} {
    const stored = localStorage.getItem('auth-storage');
    const authStore = JSON.parse(stored || '{}');

    return authStore;
}