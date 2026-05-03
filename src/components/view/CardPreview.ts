import { ensureElement } from '../../utils/utils';
import { categoryMap } from '../../utils/constants';
import { Card, ICardData } from './Card';

export interface ICardPreviewData extends ICardData {
    category: string;
    image: string;
    description: string;
    inCart: boolean;
}

export type TCardPreviewActions = {
    onButtonClick: () => void;
};

export class CardPreview extends Card<ICardPreviewData> {
    protected _category: HTMLElement;
    protected _image: HTMLImageElement;
    protected _description: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, actions: TCardPreviewActions) {
        super(container);
        this._category = ensureElement<HTMLElement>('.card__category', container);
        this._image = ensureElement<HTMLImageElement>('.card__image', container);
        this._description = ensureElement<HTMLElement>('.card__text', container);
        this._button = ensureElement<HTMLButtonElement>('.card__button', container);

        this._button.addEventListener('click', actions.onButtonClick);
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

    set description(value: string) {
        this._description.textContent = value;
    }

    // Переопределяем price: при null блокируем кнопку и ставим «Недоступно»
    set price(value: number | null) {
        this._price.textContent = value !== null ? `${value} синапсов` : 'Бесценно';
        this._button.disabled = value === null;
        if (value === null) {
            this._button.textContent = 'Недоступно';
        }
    }

    // Меняем текст только если кнопка не заблокирована (цена задана)
    set inCart(value: boolean) {
        if (!this._button.disabled) {
            this._button.textContent = value ? 'Удалить из корзины' : 'В корзину';
        }
    }
}
