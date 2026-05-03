import type { IBuyer, IBuyerErrors, TPayment } from '../types';
import type { IEvents } from '../components/base/Events';

export class Buyer {
    protected payment: TPayment | '' = '';
    protected email = '';
    protected phone = '';
    protected address = '';

    constructor(protected events: IEvents) {}

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
        this.events.emit('buyer:changed', this.validate());
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
        this.events.emit('buyer:changed', this.validate());
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
