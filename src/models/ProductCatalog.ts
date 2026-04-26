import type { IProduct } from '../types';

export class ProductCatalog {
    protected products: IProduct[] = [];
    protected selectedProduct: IProduct | null = null;

    constructor() {}

    setProducts(products: IProduct[]): void {
        this.products = products;
    }

    getProducts(): IProduct[] {
        return this.products;
    }

    getProductById(id: string): IProduct | undefined {
        return this.products.find((product) => product.id === id);
    }

    setSelectedProduct(product: IProduct | null): void {
        this.selectedProduct = product;
    }

    getSelectedProduct(): IProduct | null {
        return this.selectedProduct;
    }
}
