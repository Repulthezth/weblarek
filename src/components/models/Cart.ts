import type { IProduct } from '../../types';
import type { IEvents } from '../base/Events';

export class Cart {
    protected items: IProduct[] = [];

    constructor(protected events: IEvents) {}

    getItems(): IProduct[] {
        return this.items;
    }

    addItem(product: IProduct): void {
        this.items.push(product);
        this.events.emit('cart:changed');
    }

    removeItem(product: IProduct): void {
        this.items = this.items.filter((item) => item.id !== product.id);
        this.events.emit('cart:changed');
    }

    clear(): void {
        this.items = [];
        this.events.emit('cart:changed');
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
