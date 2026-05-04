import './scss/styles.scss';

import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { CommunicationLayer } from './api/CommunicationLayer';
import { ProductCatalog } from './components/models/ProductCatalog';
import { Cart } from './components/models/Cart';
import { Buyer } from './components/models/Buyer';

import { Header } from './components/view/Header';
import { Catalog } from './components/view/Catalog';
import { Modal } from './components/view/Modal';
import { CardCatalog } from './components/view/CardCatalog';
import { CardPreview } from './components/view/CardPreview';
import { CardBasket } from './components/view/CardBasket';
import { Basket } from './components/view/Basket';
import { OrderForm } from './components/view/OrderForm';
import { ContactsForm } from './components/view/ContactsForm';
import { OrderSuccess } from './components/view/OrderSuccess';

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
const headerElement = ensureElement<HTMLElement>('.header');
const galleryElement = ensureElement<HTMLElement>('.gallery');
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
const header = new Header(headerElement, events);
const catalog = new Catalog(galleryElement);
const modal = new Modal(modalContainer);
const cardPreview = new CardPreview(cloneTemplate(cardPreviewTemplate), {
    onButtonClick: () => events.emit('preview:button-click'),
});
const basket = new Basket(cloneTemplate(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate<HTMLFormElement>(orderTemplate), events);
const contactsForm = new ContactsForm(cloneTemplate<HTMLFormElement>(contactsTemplate), events);
const orderSuccess = new OrderSuccess(cloneTemplate(successTemplate), events);

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
    catalog.render({ catalog: cards });
    header.render({ counter: cartModel.getItemCount() });
});

// Выбранный для просмотра товар изменился — открыть или закрыть предпросмотр.
events.on('preview:changed', () => {
    const product = catalogModel.getSelectedProduct();
    if (!product) {
        modal.close();
        return;
    }
    const inCart = cartModel.hasItem(product.id);
    const unavailable = product.price === null;
    modal.render({
        content: cardPreview.render({
            title: product.title,
            price: product.price,
            category: product.category,
            image: CDN_URL + product.image,
            description: product.description,
            buttonDisabled: unavailable,
            buttonText: unavailable ? 'Недоступно' : inCart ? 'Удалить из корзины' : 'В корзину',
        }),
    });
    modal.open();
});

// Состав корзины изменился — обновить счётчик и список товаров в корзине.
events.on('cart:changed', () => {
    header.render({ counter: cartModel.getItemCount() });
    basket.render({ items: renderBasketCards(), total: cartModel.getTotalPrice() });
});

// Данные покупателя изменились — обновить валидность и ошибки обеих форм.
events.on('buyer:changed', () => {
    const errors = buyerModel.validate();
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
    modal.render({ content: basket.render() });
    modal.open();
});

// Пользователь нажал на карточку в галерее.
events.on<{ id: string }>('card:select', ({ id }) => {
    catalogModel.setSelectedProduct(catalogModel.getProductById(id) ?? null);
});

// Пользователь нажал кнопку в предпросмотре товара.
events.on('preview:button-click', () => {
    const product = catalogModel.getSelectedProduct();
    if (product) {
        if (cartModel.hasItem(product.id)) {
            cartModel.removeItem(product);
        } else {
            cartModel.addItem(product);
        }
        modal.close();
    }
});

// Пользователь нажал кнопку удаления в корзине.
events.on<{ id: string }>('cart:remove', ({ id }) => {
    const product = catalogModel.getProductById(id);
    if (product) {
        cartModel.removeItem(product);
    }
});

// Пользователь нажал «Оформить» в корзине.
events.on('basket:checkout', () => {
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
            modal.render({ content: orderSuccess.render({ total: response.total }) });
            cartModel.clear();
            buyerModel.clear();
        })
        .catch((err) => console.error('Ошибка оформления заказа:', err));
});

// Пользователь нажал «За новыми покупками!».
events.on('success:close', () => {
    modal.close();
});

// ================================================================
// ИНИЦИАЛИЗАЦИЯ
// ================================================================
communication
    .fetchProducts()
    .then((response) => catalogModel.setProducts(response.items))
    .catch((err) => console.error('Ошибка загрузки каталога:', err));
