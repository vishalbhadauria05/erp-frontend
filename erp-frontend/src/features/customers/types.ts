export interface Customer {
  _id: string;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  billingAddress?: string;
  shippingAddress?: string;
  creditLimit: number;
  outstandingBalance: number;
  createdAt?: string;
}

export interface CustomerFormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber: string;
  billingAddress: string;
  shippingAddress: string;
  creditLimit: number;
  outstandingBalance: number;
}
