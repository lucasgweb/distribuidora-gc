import { UserDTO } from "../dtos/user.dto";
import { api } from "../lib/api";


export const listUsers = async (): Promise<UserDTO[]> => {
    const response = await api.get<{users: UserDTO[]}>('/users');
    return response.data.users;
};