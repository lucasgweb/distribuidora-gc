import { ClientDTO } from "./client.dto";
import { ProductDTO } from "./product.dto";
import { UserDTO } from "./user.dto";

export interface CreateSaleItemDTO {
  productId: string;
  soldQuantity: number;
  returnedQuantity?: number;
  negotiatedPrice?: number;
  negotiatedCylinderPrice?: number;
}

export interface CreateSaleDTO {
  clientId: string;
 paymentMethod: 'CASH' | 'YAPE';
  items: CreateSaleItemDTO[];
}

export interface SaleDTO {
  id: string;
  code: number;
  client: ClientDTO;
  user: UserDTO;
  items: SaleItemDTO[];
  totalAmount: number;
  debt: number;
  paymentMethod: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItemDTO {
  id: string;
  product: ProductDTO;
  soldQuantity: number;
  returnedQuantity: number;
  negotiatedPrice?: number;
  negotiatedCylinderPrice?: number;
}