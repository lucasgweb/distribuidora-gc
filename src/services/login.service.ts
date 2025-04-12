import { api } from "../lib/api";

type Payload = {
    email: string;
    password: string;
}

type Response = {
    token: string;
};

export async function loginService(payload: Payload): Promise<Response> {
    const response = await api.post('/sessions', payload);


    return response.data;

}