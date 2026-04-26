import type { IBuyer, IBuyerErrors, TPayment } from '../types';

export class Buyer {
    protected payment: TPayment | '' = '';
    protected email = '';
    protected phone = '';
    protected address = '';

    constructor() {}

    setData(data: Partial<IBuyer>): void {
        if (data.payment !== undefined) {
            this.payment = data.payment;
        }
        if (data.email !== undefined) {
            this.email = data.email;
        }
        if (data.phone !== undefined) {
            this.phone = data.phone;
        }
        if (data.address !== undefined) {
            this.address = data.address;
        }
    }

    getData(): IBuyer {
        return {
            payment: this.payment,
            email: this.email,
            phone: this.phone,
            address: this.address,
        };
    }

    clear(): void {
        this.payment = '';
        this.email = '';
        this.phone = '';
        this.address = '';
    }

    validate(): IBuyerErrors {
        const errors: IBuyerErrors = {};

        if (!this.payment) {
            errors.payment = 'Не выбран вид оплаты';
        }
        if (!this.email.trim()) {
            errors.email = 'Укажите емэйл';
        }
        if (!this.phone.trim()) {
            errors.phone = 'Укажите телефон';
        }
        if (!this.address.trim()) {
            errors.address = 'Укажите адрес';
        }

        return errors;
    }
}
