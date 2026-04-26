import type { IApi, IOrderRequest, IOrderResponse, IProductsResponse } from '../types';

export class CommunicationLayer {
    private api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    fetchProducts(): Promise<IProductsResponse> {
        return this.api.get<IProductsResponse>('/product/');
    }

    sendOrder(order: IOrderRequest): Promise<IOrderResponse> {
        return this.api.post<IOrderResponse>('/order/', order);
    }
}
