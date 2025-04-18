import { UserDTO } from "../dtos/user.dto";
import { api } from "../lib/api";

type Response = {
    user: UserDTO;
};

export async function profileService(): Promise<Response> {
    const response = await api.get('/me');


    return response.data;

}