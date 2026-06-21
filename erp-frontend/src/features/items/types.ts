export type ItemType = 'Duplex' | 'Reel' | 'PrintedPaper' | 'FinishedGood' | 'Consumable' | 'RawMaterial';

export interface ItemSpecification {
  gsm?: string;
  dimensions?: string;
}

export interface BoxSpecification {
  boxType?: string;
  boxesPerSheet?: number;
  itemSerialNumber?: string;
  dieSerialNumber?: string;
  length?: number;
  breadth?: number;
  height?: number;
  sheetLength?: number;
  sheetBreadth?: number;
}

export interface Item {
  _id: string;
  itemCode: string;
  itemName: string;
  brand?: string;
  type: ItemType;
  category: string;
  itemSpecification?: ItemSpecification;
  specifications?: ItemSpecification;
  boxSpecification?: BoxSpecification;
  unitOfMeasure: string;
  createdAt?: string;
}

export interface ItemFormData {
  itemName: string;
  brand?: string;
  type: ItemType;
  category: string;
  itemSpecification?: {
    gsm?: string;
    dimensions?: string;
  };
  boxSpecification?: BoxSpecification;
  unitOfMeasure: string;
}
