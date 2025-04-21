import { api } from "../lib/api";

type Payload = {
    name: string;
    email: string;
    password: string;
    code:string;
}

type Response = {
    token: string;
};

export async function registerService(payload: Payload): Promise<Response> {
    const response = await api.post('/users', payload);


    return response.data;

}