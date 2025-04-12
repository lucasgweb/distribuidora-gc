import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/use-auth.store";
import { loginService } from "../services/login.service";
import { profileService } from "../services/me-profile.service";

export function useAuth() {
  const navigate = useNavigate();

  const {
    actions: { clear, setToken, setUser },
  } = useAuthStore.getState();
  const logout = () => {
    clear();
    navigate("/login");
  };

  const login = async (email: string, password: string) => {
    const { token } = await loginService({
      email,
      password,
    });

    setToken(token);

    const { user } = await profileService();

    setUser(user);
  };

  return {
    logout,
    login,
  };
}
