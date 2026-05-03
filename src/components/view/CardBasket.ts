import { ensureElement } from '../../utils/utils';
import { Card, ICardData } from './Card';

export interface ICardBasketData extends ICardData {
    index: number;
}

export type TCardBasketActions = {
    onDelete: () => void;
};

export class CardBasket extends Card<ICardBasketData> {
    protected _index: HTMLElement;
    protected _deleteButton: HTMLButtonElement;

    constructor(container: HTMLElement, actions: TCardBasketActions) {
        super(container);
        this._index = ensureElement<HTMLElement>('.basket__item-index', container);
        this._deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

        this._deleteButton.addEventListener('click', actions.onDelete);
    }

    set index(value: number) {
        this._index.textContent = String(value);
    }
}
