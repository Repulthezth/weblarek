import './scss/styles.scss';
import { apiProducts } from './utils/data';
import { ProductCatalog } from './models/ProductCatalog';
import { Cart } from './models/Cart';
import { Buyer } from './models/Buyer';
import { Api } from './components/base/Api';
import { CommunicationLayer } from './api/CommunicationLayer';
import { API_URL } from './utils/constants';

const catalogModel = new ProductCatalog();

catalogModel.setProducts(apiProducts.items);
console.log('Каталог товаров:', catalogModel.getProducts());

const firstProduct = apiProducts.items[0];
console.log('Товар по id:', catalogModel.getProductById(firstProduct.id));

catalogModel.setSelectedProduct(firstProduct);
console.log('Выбранный товар для просмотра:', catalogModel.getSelectedProduct());

const cartModel = new Cart();
cartModel.addItem(firstProduct);
cartModel.addItem(apiProducts.items[1]);
console.log('Товары в корзине после добавления:', cartModel.getItems());
console.log('Товар есть в корзине по id:', cartModel.hasItem(firstProduct.id));
console.log('Общая стоимость корзины:', cartModel.getTotalPrice());
console.log('Количество товаров в корзине:', cartModel.getItemCount());

cartModel.removeItem(firstProduct);
console.log('Корзина после удаления товара:', cartModel.getItems());

cartModel.clear();
console.log('Корзина после очистки:', cartModel.getItems());

const buyerModel = new Buyer();

buyerModel.setData({ payment: 'card', email: 'test@example.com' });
console.log('Данные покупателя после частичного сохранения:', buyerModel.getData());
console.log('Ошибки валидации после частичного заполнения:', buyerModel.validate());

buyerModel.setData({ phone: '+79999999999', address: 'г. Москва, ул. Программирования, 1' });
console.log('Полные данные покупателя:', buyerModel.getData());
console.log('Ошибки валидации после заполнения всех полей:', buyerModel.validate());

buyerModel.clear();
console.log('Данные покупателя после очистки:', buyerModel.getData());

const api = new Api(API_URL);
const communicationLayer = new CommunicationLayer(api);

communicationLayer.fetchProducts()
    .then((response) => {
        catalogModel.setProducts(response.items);
        console.log('Каталог товаров из сервера:', catalogModel.getProducts());
    })
    .catch((error) => {
        console.error('Ошибка получения товаров с сервера:', error);
    });
