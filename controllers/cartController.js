const { getProductById } = require('../helpers/store');
const { getCart, saveCart } = require('../helpers/cart');
const { setFlash } = require('../middleware');

function cartPage(req, res) {
  res.render('cart');
}

function addOrUpdateCartItem(cart, product, quantity) {
  const existing = cart.find(item => item.product_id === product.id);

  if (existing) {
    existing.qty += quantity;
    existing.line_total_thb = existing.qty * Number(existing.price_thb || 0);
    existing.line_total_idr = existing.qty * Number(existing.price_idr || 0);
  } else {
    cart.push({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      thumbnail: product.thumbnail,
      status: product.status,
      price_thb: Number(product.price_thb || 0),
      price_idr: Number(product.price_idr || 0),
      qty: quantity,
      line_total_thb: quantity * Number(product.price_thb || 0),
      line_total_idr: quantity * Number(product.price_idr || 0)
    });
  }

  return cart;
}

function addToCart(req, res) {
  const { product_id, qty = 1 } = req.body;
  const product = getProductById(product_id);

  if (!product || !product.visible) {
    setFlash(req, 'danger', 'Product not found.');
    return res.redirect('/shop');
  }

  if (product.status === 'sold_out') {
    setFlash(req, 'danger', 'Produk sold out tidak bisa dimasukkan ke cart.');
    return res.redirect(`/product/${product.slug}`);
  }

  const quantity = Math.max(1, Number(qty || 1));
  const cart = getCart(req);

  addOrUpdateCartItem(cart, product, quantity);
  saveCart(req, cart);

  setFlash(req, 'success', 'Produk berhasil ditambahkan ke ker
