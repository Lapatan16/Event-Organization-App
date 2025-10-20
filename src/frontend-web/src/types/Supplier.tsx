export type SupplierProduct = 
{
    id: string,
    name: string,
    amount: number,
    unit: string,
    price: number,
};

export type Supplier = 
{
    id: string,
    supplierId: string,
    type: string,
    name: string,
    poster: string,
    contact: string,
    description: string,
    products: Array<SupplierProduct>,
};