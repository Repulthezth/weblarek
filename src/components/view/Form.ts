import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

export interface IFormData {
    valid: boolean;
    errors: string;
}

export abstract class Form<T extends IFormData> extends Component<T> {
    protected _submitButton: HTMLButtonElement;
    protected _errorsContainer: HTMLElement;
    private readonly _formName: string;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container);
        this._formName = container.name;
        this._submitButton = ensureElement<HTMLButtonElement>('[type="submit"]', container);
        this._errorsContainer = ensureElement<HTMLElement>('.form__errors', container);

        container.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            events.emit(`${this._formName}:change`, {
                field: target.name,
                value: target.value,
            });
        });

        container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            events.emit(`${this._formName}:submit`);
        });
    }

    set valid(value: boolean) {
        this._submitButton.disabled = !value;
    }

    set errors(value: string) {
        this._errorsContainer.textContent = value;
    }
}
