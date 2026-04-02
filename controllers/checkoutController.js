const { createOrder } = require('../helpers/store');
const { getCart, saveCart, cartTotals } = require('../helpers/cart');
const { setFlash } = require('../middleware');
const { sendTelegramOrderNotification } = require('../helpers/telegram');

function checkoutPage(req, res) {
  const cart = getCart(req);
  if (!cart.length) {
    setFlash(req, 'danger', 'Keranjang masih kosong.');
    return res.redirect('/cart');
  }
  res.render('checkout');
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

  const { customer_name, whatsapp, address, note } = req.body;
  if (!customer_name || !whatsapp || !address) {
    setFlash(req, 'danger', 'Nama, WhatsApp, dan alamat wajib diisi.');
    return res.redirect('/checkout');
  }

  const totals = cartTotals(cart);
  const order = createOrder({ customer_name, whatsapp, address, note, items: cart, total_thb: totals.total_thb, total_idr: totals.total_idr });

  try { await sendTelegramOrderNotification(order, res.locals.settings); } catch (error) { console.error('Telegram notification failed:', error.message); }

  saveCart(req, []);
  res.render('checkout-success', { order });
}

module.exports = { checkoutPage, placeOrder };
