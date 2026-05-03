import { Component } from '../base/Component';

interface ICatalogData {
    catalog: HTMLElement[];
}

export class Catalog extends Component<ICatalogData> {
    constructor(container: HTMLElement) {
        super(container);
    }

    set catalog(items: HTMLElement[]) {
        this.container.replaceChildren(...items);
    }
}
