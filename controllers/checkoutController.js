const { createOrder } = require('../helpers/store');
const { getCart, saveCart, cartTotals, cartCount } = require('../helpers/cart');
const { setFlash } = require('../middleware');
const { sendTelegramOrderNotification } = require('../helpers/telegram');

function checkoutPage(req, res) {
  const cart = getCart(req);

  if (!cart.length) {
    setFlash(req, 'danger', 'Keranjang masih kosong.');
    return res.redirect('/cart');
  }

  const totals = cartTotals(cart);

  return res.render('checkout', {
    cart,
    cartTotals: totals
  });
}

async function placeOrder(req, res) {
  const cart = getCart(req);

  if (!cart.length) {
    setFlash(req, 'danger', 'Keranjang masih kosong.');
    return res.redirect('/cart');
  }

  if (cart.some(item => item.status === 'sold_out')) {
    setFlash(req, 'danger', 'Ada produk sold out di keranjang.');
    return res.redirect('/cart');
  }

  let { customer_name, whatsapp, address, note } = req.body;

  customer_name = String(customer_name || '').trim();
  whatsapp = String(whatsapp || '').trim();
  address = String(address || '').trim();
  note = String(note || '').trim();

  if (!customer_name || !whatsapp || !address) {
    setFlash(req, 'danger', 'Nama, WhatsApp, dan alamat wajib diisi.');
    return res.redirect('/checkout');
  }

  whatsapp = whatsapp.replace(/[^\d+]/g, '');

  const totals = cartTotals(cart);

  const orderPayload = {
    customer_name,
    whatsapp,
    address,
    note,
    items: cart,
    total_items: cartCount(cart),
    total_thb: totals.total_thb,
    total_idr: totals.total_idr
  };

  const order = createOrder(orderPayload);

  try {
    await sendTelegramOrderNotification(order, res.locals.settings);
  } catch (error) {
    console.error('Telegram notification failed:', error.message);
  }

  saveCart(req, []);

  return res.render('checkout-success', {
    order
  });
}

module.exports = {
  checkoutPage,
  placeOrder
};
