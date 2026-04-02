const router = require('express').Router();
const siteController = require('../controllers/siteController');
const cartController = require('../controllers/cartController');
const checkoutController = require('../controllers/checkoutController');

router.get('/', siteController.home);
router.get('/shop', siteController.shop);
router.get('/product/:slug', siteController.productDetail);
router.get('/articles', siteController.articles);
router.get('/article/:slug', siteController.articleDetail);
router.get('/contact', siteController.contact);

router.get('/cart', cartController.cartPage);
router.post('/cart/add', cartController.addToCart);
router.post('/cart/update', cartController.updateCart);
router.post('/cart/remove/:productId', cartController.removeFromCart);

router.get('/checkout', checkoutController.checkoutPage);
router.post('/checkout', checkoutController.placeOrder);

module.exports = router;
