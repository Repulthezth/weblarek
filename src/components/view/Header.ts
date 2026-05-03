import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface IHeaderData {
    counter: number;
}

export class Header extends Component<IHeaderData> {
    protected _counter: HTMLElement;
    protected _basket: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this._counter = ensureElement<HTMLElement>('.header__basket-counter', container);
        this._basket = ensureElement<HTMLButtonElement>('.header__basket', container);

        this._basket.addEventListener('click', () => {
            events.emit('basket:open');
        });
    }

    set counter(value: number) {
        this._counter.textContent = String(value);
    }
}
