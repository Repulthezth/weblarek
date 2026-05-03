import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface IPageData {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}

export class Page extends Component<IPageData> {
    protected _counter: HTMLElement;
    protected _catalog: HTMLElement;
    protected _basket: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this._counter = ensureElement<HTMLElement>('.header__basket-counter', container);
        this._catalog = ensureElement<HTMLElement>('.gallery', container);
        this._basket = ensureElement<HTMLButtonElement>('.header__basket', container);

        this._basket.addEventListener('click', () => {
            events.emit('basket:open');
        });
    }

    set counter(value: number) {
        this._counter.textContent = String(value);
    }

    set catalog(items: HTMLElement[]) {
        this._catalog.replaceChildren(...items);
    }

    set locked(value: boolean) {
        this.container.classList.toggle('page__wrapper_locked', value);
    }
}
