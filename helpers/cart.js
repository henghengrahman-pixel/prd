function getCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

function saveCart(req, items) {
  req.session.cart = items;
  return items;
}

function cartCount(cart = []) {
  return cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
}

function cartTotals(cart = []) {
  return cart.reduce((acc, item) => {
    acc.total_thb += Number(item.line_total_thb || 0);
    acc.total_idr += Number(item.line_total_idr || 0);
    return acc;
  }, { total_thb: 0, total_idr: 0 });
}

module.exports = { getCart, saveCart, cartCount, cartTotals };
