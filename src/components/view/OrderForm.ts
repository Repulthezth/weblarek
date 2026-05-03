import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { Form, IFormData } from './Form';
import type { TPayment } from '../../types';

export interface IOrderFormData extends IFormData {
    payment: TPayment | '';
    address: string;
}

export class OrderForm extends Form<IOrderFormData> {
    protected _buttonCard: HTMLButtonElement;
    protected _buttonCash: HTMLButtonElement;
    protected _addressInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this._buttonCard = ensureElement<HTMLButtonElement>('[name="card"]', container);
        this._buttonCash = ensureElement<HTMLButtonElement>('[name="cash"]', container);
        this._addressInput = ensureElement<HTMLInputElement>('[name="address"]', container);

        this._buttonCard.addEventListener('click', () => {
            events.emit('order:change', { field: 'payment', value: 'card' });
        });

        this._buttonCash.addEventListener('click', () => {
            events.emit('order:change', { field: 'payment', value: 'cash' });
        });
    }

    set payment(value: TPayment | '') {
        this._buttonCard.classList.toggle('button_alt-active', value === 'card');
        this._buttonCash.classList.toggle('button_alt-active', value === 'cash');
    }

    set address(value: string) {
        this._addressInput.value = value;
    }
}
