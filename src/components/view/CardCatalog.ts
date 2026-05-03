import { ensureElement } from '../../utils/utils';
import { categoryMap } from '../../utils/constants';
import { Card, ICardData } from './Card';

export interface ICardCatalogData extends ICardData {
    category: string;
    image: string;
}

export type TCardCatalogActions = {
    onClick: () => void;
};

export class CardCatalog extends Card<ICardCatalogData> {
    protected _category: HTMLElement;
    protected _image: HTMLImageElement;

    constructor(container: HTMLElement, actions: TCardCatalogActions) {
        super(container);
        this._category = ensureElement<HTMLElement>('.card__category', container);
        this._image = ensureElement<HTMLImageElement>('.card__image', container);

        container.addEventListener('click', actions.onClick);
    }

    set category(value: string) {
        this._category.textContent = value;
        this._category.className = 'card__category';
        this._category.classList.add(
            categoryMap[value as keyof typeof categoryMap] ?? 'card__category_other'
        );
    }

    set image(src: string) {
        this.setImage(this._image, src);
    }
}
