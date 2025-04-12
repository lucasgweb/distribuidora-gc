import { UserDto } from "../dtos/user.dto";
import { api } from "../lib/api";

type Response = {
    user: UserDto;
};

export async function profileService(): Promise<Response> {
    const response = await api.get('/me');


    return response.data;

}