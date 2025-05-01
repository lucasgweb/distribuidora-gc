export interface CreateClientDTO {
  name: string;
  document?: string;
  address?: string | null;
  phone: string;
  email?: string | null;
}

export interface UpdateClientDTO extends Partial<CreateClientDTO> {
  id: string;
}

export interface ClientDTO {
  id: string;
  name: string;
  document: string;
  address: string | null;
  phone: string;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}