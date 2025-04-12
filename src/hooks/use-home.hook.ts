import { getAuthStore } from "../utils/get-auth-store.util";

export function useHome() {
    const { state } = getAuthStore();
    const token = state?.token;
    const user = state?.user;

    return {
        token,
        user
    }
}