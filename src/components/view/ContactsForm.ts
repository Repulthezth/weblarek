import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { Form, IFormData } from './Form';

export interface IContactsFormData extends IFormData {
    email: string;
    phone: string;
}

export class ContactsForm extends Form<IContactsFormData> {
    protected _emailInput: HTMLInputElement;
    protected _phoneInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this._emailInput = ensureElement<HTMLInputElement>('[name="email"]', container);
        this._phoneInput = ensureElement<HTMLInputElement>('[name="phone"]', container);
    }

    set email(value: string) {
        this._emailInput.value = value;
    }

    set phone(value: string) {
        this._phoneInput.value = value;
    }
}
