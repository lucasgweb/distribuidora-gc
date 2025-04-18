import { ProductDTO } from "./product.dto";

export interface InventoryDTO {
  id: string;
  productId: string;
  fullCylinders: number;
  emptyCylinders: number;
  createdAt: Date;
  updatedAt: Date;
  product?: ProductDTO;
}

export interface UpdateInventoryDTO {
  fullCylinders: number;
  emptyCylinders: number;
}