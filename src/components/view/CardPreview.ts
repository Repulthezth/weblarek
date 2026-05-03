import { ensureElement } from '../../utils/utils';
import { categoryMap } from '../../utils/constants';
import { Card, ICardData } from './Card';

export interface ICardPreviewData extends ICardData {
    category: string;
    image: string;
    description: string;
    buttonDisabled: boolean;
    buttonText: string;
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

    set buttonDisabled(value: boolean) {
        this._button.disabled = value;
    }

    set buttonText(value: string) {
        this._button.textContent = value;
    }

}
