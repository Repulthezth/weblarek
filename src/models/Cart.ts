import type { IProduct } from '../types';

export class Cart {
    private items: IProduct[] = [];

    constructor() {}

    getItems(): IProduct[] {
        return this.items;
    }

    addItem(product: IProduct): void {
        this.items.push(product);
    }

    removeItem(product: IProduct): void {
        this.items = this.items.filter((item) => item.id !== product.id);
    }

    clear(): void {
        this.items = [];
    }

    getTotalPrice(): number {
        return this.items.reduce((total, product) => {
            return total + (product.price ?? 0);
        }, 0);
    }

    getItemCount(): number {
        return this.items.length;
    }

    hasItem(id: string): boolean {
        return this.items.some((item) => item.id === id);
    }
}
