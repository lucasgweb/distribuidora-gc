import { InventoryDTO } from "./inventory.dto";

export interface CreateProductDTO {
  name: string;
  basePrice: number;
  emptyCylinderPrice: number;
  allowPriceNegotiation: boolean;
  allowCylinderNegotiation: boolean;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  id: string;
}

export interface ProductDTO {
  id: string;
  name: string;
  basePrice: number;
  emptyCylinderPrice: number;
  allowPriceNegotiation: boolean;
  allowCylinderNegotiation: boolean;
  createdAt: Date;
  updatedAt: Date;
  inventory?: InventoryDTO;
}