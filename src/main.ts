import './scss/styles.scss';

import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { CommunicationLayer } from './api/CommunicationLayer';
import { ProductCatalog } from './models/ProductCatalog';
import { Cart } from './models/Cart';
import { Buyer } from './models/Buyer';

import { Page } from './components/view/Page';
import { Modal } from './components/view/Modal';
import { CardCatalog } from './components/view/CardCatalog';
import { CardPreview } from './components/view/CardPreview';
import { CardBasket } from './components/view/CardBasket';
import { Basket } from './components/view/Basket';
import { OrderForm } from './components/view/OrderForm';
import { ContactsForm } from './components/view/ContactsForm';
import { OrderSuccess } from './components/view/OrderSuccess';

import type { IBuyerErrors } from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

// ---- Инфраструктура ----
const events = new EventEmitter();
const api = new Api(API_URL);
const communication = new CommunicationLayer(api);

// ---- Модели данных ----
const catalogModel = new ProductCatalog(events);
const cartModel = new Cart(events);
const buyerModel = new Buyer(events);

// ---- Корневые DOM-элементы ----
const pageWrapper = ensureElement<HTMLElement>('.page__wrapper');
const modalContainer = ensureElement<HTMLElement>('#modal-container');

// ---- Шаблоны ----
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// ---- Компоненты представления ----
const page = new Page(pageWrapper, events);
const modal = new Modal(modalContainer, events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate<HTMLFormElement>(orderTemplate), events);
const contactsForm = new ContactsForm(cloneTemplate<HTMLFormElement>(contactsTemplate), events);

// Ссылка на текущий открытый предпросмотр карточки.
// Нужна, чтобы обновлять кнопку «В корзину/Убрать» при изменении корзины.
let currentPreview: CardPreview | null = null;

// ---- Вспомогательная функция ----
// Создаёт разметку строк корзины из текущего состояния модели.
function renderBasketCards(): HTMLElement[] {
    return cartModel.getItems().map((product, index) => {
        const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
            onDelete: () => events.emit('cart:remove', { id: product.id }),
        });
        return card.render({ title: product.title, price: product.price, index: index + 1 });
    });
}

// ================================================================
// СОБЫТИЯ МОДЕЛЕЙ ДАННЫХ
// Представление перерисовывается только здесь.
// ================================================================

// Каталог товаров обновлён — перерисовать галерею и счётчик.
events.on('catalog:changed', () => {
    const cards = catalogModel.getProducts().map((product) => {
        const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', { id: product.id }),
        });
        return card.render({
            title: product.title,
            price: product.price,
            category: product.category,
            image: CDN_URL + product.image,
        });
    });
    page.render({ catalog: cards, counter: cartModel.getItemCount() });
});

// Выбранный для просмотра товар изменился — открыть или закрыть предпросмотр.
events.on('preview:changed', () => {
    const product = catalogModel.getSelectedProduct();
    if (!product) {
        currentPreview = null;
        modal.close();
        page.render({ locked: false });
        return;
    }
    currentPreview = new CardPreview(cloneTemplate(cardPreviewTemplate), {
        onButtonClick: () => {
            if (cartModel.hasItem(product.id)) {
                events.emit('cart:remove', { id: product.id });
            } else {
                events.emit('cart:add', { id: product.id });
            }
        },
    });
    modal.render({
        content: currentPreview.render({
            title: product.title,
            price: product.price,
            category: product.category,
            image: CDN_URL + product.image,
            description: product.description,
            inCart: cartModel.hasItem(product.id),
        }),
    });
    modal.open();
    page.render({ locked: true });
});

// Состав корзины изменился — обновить счётчик, корзину и кнопку в предпросмотре.
events.on('cart:changed', () => {
    page.render({ counter: cartModel.getItemCount() });
    basket.render({ items: renderBasketCards(), total: cartModel.getTotalPrice() });
    const selected = catalogModel.getSelectedProduct();
    if (currentPreview && selected) {
        currentPreview.render({ inCart: cartModel.hasItem(selected.id) });
    }
});

// Данные покупателя изменились — обновить валидность и ошибки обеих форм.
events.on<IBuyerErrors>('buyer:changed', (errors) => {
    const buyer = buyerModel.getData();
    orderForm.render({
        payment: buyer.payment,
        address: buyer.address,
        valid: !errors.payment && !errors.address,
        errors: [errors.payment, errors.address].filter(Boolean).join('; '),
    });
    contactsForm.render({
        email: buyer.email,
        phone: buyer.phone,
        valid: !errors.email && !errors.phone,
        errors: [errors.email, errors.phone].filter(Boolean).join('; '),
    });
});

// ================================================================
// СОБЫТИЯ ПРЕДСТАВЛЕНИЯ
// Презентер вызывает методы моделей, не генерирует события сам.
// ================================================================

// Пользователь открыл корзину.
events.on('basket:open', () => {
    modal.render({
        content: basket.render({ items: renderBasketCards(), total: cartModel.getTotalPrice() }),
    });
    modal.open();
    page.render({ locked: true });
});

// Пользователь закрыл модальное окно кнопкой или оверлеем.
events.on('modal:close', () => {
    currentPreview = null;
    page.render({ locked: false });
});

// Пользователь нажал на карточку в галерее.
events.on<{ id: string }>('card:select', ({ id }) => {
    catalogModel.setSelectedProduct(catalogModel.getProductById(id) ?? null);
});

// Пользователь нажал «В корзину» в предпросмотре.
events.on<{ id: string }>('cart:add', ({ id }) => {
    const product = catalogModel.getProductById(id);
    if (product && !cartModel.hasItem(id)) {
        cartModel.addItem(product);
        catalogModel.setSelectedProduct(null); // закрывает модалку через preview:changed
    }
});

// Пользователь нажал «Удалить из корзины» в предпросмотре или кнопку удаления в корзине.
events.on<{ id: string }>('cart:remove', ({ id }) => {
    const product = catalogModel.getProductById(id);
    if (product) {
        cartModel.removeItem(product);
        if (currentPreview) {
            // Удаление из превью — закрываем модалку так же, как при добавлении
            catalogModel.setSelectedProduct(null);
        }
    }
});

// Пользователь нажал «Оформить» в корзине.
events.on('basket:checkout', () => {
    buyerModel.clear();
    modal.render({ content: orderForm.render() });
});

// Пользователь изменил способ оплаты или адрес доставки.
events.on<{ field: string; value: string }>('order:change', ({ field, value }) => {
    buyerModel.setData({ [field]: value } as Parameters<typeof buyerModel.setData>[0]);
});

// Пользователь нажал «Далее» в форме заказа.
events.on('order:submit', () => {
    modal.render({ content: contactsForm.render() });
});

// Пользователь изменил email или телефон.
events.on<{ field: string; value: string }>('contacts:change', ({ field, value }) => {
    buyerModel.setData({ [field]: value } as Parameters<typeof buyerModel.setData>[0]);
});

// Пользователь нажал «Оплатить».
events.on('contacts:submit', () => {
    const buyer = buyerModel.getData();
    communication
        .sendOrder({
            ...buyer,
            total: cartModel.getTotalPrice(),
            items: cartModel.getItems().map((p) => p.id),
        })
        .then((response) => {
            const successView = new OrderSuccess(cloneTemplate(successTemplate), events);
            modal.render({ content: successView.render({ total: response.total }) });
            cartModel.clear();
            buyerModel.clear();
        })
        .catch((err) => console.error('Ошибка оформления заказа:', err));
});

// Пользователь нажал «За новыми покупками!».
events.on('success:close', () => {
    modal.close();
    page.render({ locked: false });
});

// ================================================================
// ИНИЦИАЛИЗАЦИЯ
// ================================================================
communication
    .fetchProducts()
    .then((response) => catalogModel.setProducts(response.items))
    .catch((err) => console.error('Ошибка загрузки каталога:', err));
