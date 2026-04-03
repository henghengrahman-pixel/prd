const { getProductById } = require('../helpers/store');
const { getCart, saveCart } = require('../helpers/cart');
const { setFlash } = require('../middleware');

function buildCartItem(product, quantity) {
  return {
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
  };
}

function cartPage(req, res) {
  const cart = getCart(req);

  const summary = cart.reduce(
    (acc, item) => {
      acc.total_qty += Number(item.qty || 0);
      acc.total_thb += Number(item.line_total_thb || 0);
      acc.total_idr += Number(item.line_total_idr || 0);
      return acc;
    },
    {
      total_qty: 0,
      total_thb: 0,
      total_idr: 0
    }
  );

  return res.render('cart', {
    cart,
    summary
  });
}

function addOrUpdateCartItem(cart, product, quantity) {
  const existing = cart.find(item => String(item.product_id) === String(product.id));

  if (existing) {
    existing.qty += quantity;
    existing.line_total_thb = existing.qty * Number(existing.price_thb || 0);
    existing.line_total_idr = existing.qty * Number(existing.price_idr || 0);
  } else {
    cart.push(buildCartItem(product, quantity));
  }

  return cart;
}

function addToCart(req, res) {
  const { product_id, qty = 1 } = req.body;
  const product = getProductById(product_id);

  if (!product || !product.visible) {
    setFlash(req, 'danger', 'Produk tidak ditemukan.');
    return res.redirect('/shop');
  }

  if (product.status === 'sold_out') {
    setFlash(req, 'danger', 'Produk sold out tidak bisa dimasukkan ke keranjang.');
    return res.redirect(`/product/${product.slug}`);
  }

  const quantity = Math.max(1, parseInt(qty, 10) || 1);
  const cart = getCart(req);

  addOrUpdateCartItem(cart, product, quantity);
  saveCart(req, cart);

  setFlash(req, 'success', 'Produk berhasil ditambahkan ke keranjang.');
  return res.redirect('/cart');
}

/*
  BELI SEKARANG:
  - langsung isi cart hanya dengan produk ini
  - lalu redirect ke checkout
*/
function buyNow(req, res) {
  const { product_id, qty = 1 } = req.body;
  const product = getProductById(product_id);

  if (!product || !product.visible) {
    setFlash(req, 'danger', 'Produk tidak ditemukan.');
    return res.redirect('/shop');
  }

  if (product.status === 'sold_out') {
    setFlash(req, 'danger', 'Produk sold out tidak bisa dibeli.');
    return res.redirect(`/product/${product.slug}`);
  }

  const quantity = Math.max(1, parseInt(qty, 10) || 1);

  const cart = [buildCartItem(product, quantity)];
  saveCart(req, cart);

  return res.redirect('/checkout');
}

function updateCart(req, res) {
  const quantities = req.body.qty || {};
  const currentCart = getCart(req);

  const updatedCart = currentCart
    .map(item => {
      const newQty = Math.max(
        1,
        parseInt(quantities[item.product_id], 10) || parseInt(item.qty, 10) || 1
      );

      return {
        ...item,
        qty: newQty,
        line_total_thb: newQty * Number(item.price_thb || 0),
        line_total_idr: newQty * Number(item.price_idr || 0)
      };
    })
    .filter(item => item.qty > 0);

  saveCart(req, updatedCart);
  setFlash(req, 'success', 'Keranjang berhasil diupdate.');
  return res.redirect('/cart');
}

function removeFromCart(req, res) {
  const { productId } = req.params;

  const cart = getCart(req).filter(
    item => String(item.product_id) !== String(productId)
  );

  saveCart(req, cart);
  setFlash(req, 'success', 'Item berhasil dihapus dari keranjang.');
  return res.redirect('/cart');
}

module.exports = {
  cartPage,
  addToCart,
  buyNow,
  updateCart,
  removeFromCart
};
