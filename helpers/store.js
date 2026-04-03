const { getCollection, saveCollection, normalizeProduct, normalizeArticle, uid, nowIso } = require('./jsonDb');

function getSettings() { return getCollection('settings.json'); }
function saveSettings(settings) { return saveCollection('settings.json', settings); }
function getCategories() { return getCollection('categories.json'); }

function getProducts() { return getCollection('products.json'); }
function saveProducts(items) { return saveCollection('products.json', items); }
function getVisibleProducts() { return getProducts().filter(item => item.visible); }
function getProductBySlug(slug) { return getProducts().find(item => item.slug === slug && item.visible); }
function getProductById(id) { return getProducts().find(item => item.id === id); }

function createProduct(payload) {
  const items = getProducts();
  const item = normalizeProduct(payload);
  items.unshift(item);
  saveProducts(items);
  return item;
}

function updateProduct(id, payload) {
  const items = getProducts();
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  items[index] = normalizeProduct(payload, items[index]);
  saveProducts(items);
  return items[index];
}

function deleteProduct(id) {
  const items = getProducts().filter(item => item.id !== id);
  saveProducts(items);
}

function getArticles() { return getCollection('articles.json'); }
function saveArticles(items) { return saveCollection('articles.json', items); }
function getVisibleArticles() { return getArticles().filter(item => item.visible); }
function getArticleBySlug(slug) { return getArticles().find(item => item.slug === slug && item.visible); }
function getArticleById(id) { return getArticles().find(item => item.id === id); }

function createArticle(payload) {
  const items = getArticles();
  const item = normalizeArticle(payload);
  items.unshift(item);
  saveArticles(items);
  return item;
}

function updateArticle(id, payload) {
  const items = getArticles();
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  items[index] = normalizeArticle(payload, items[index]);
  saveArticles(items);
  return items[index];
}

function deleteArticle(id) {
  saveArticles(getArticles().filter(item => item.id !== id));
}

function getOrders() { return getCollection('orders.json'); }
function saveOrders(items) { return saveCollection('orders.json', items); }
function getOrderById(id) { return getOrders().find(item => item.id === id); }

function createOrder(payload) {
  const items = getOrders();

  const order = {
    id: `ORD-${Date.now()}`,
    customer_name: String(payload.customer_name || '').trim(),
    whatsapp: String(payload.whatsapp || '').trim(),
    telegram: String(payload.telegram || '').replace(/^@+/, '').trim(),
    address: String(payload.address || '').trim(),
    note: String(payload.note || '').trim(),
    items: Array.isArray(payload.items) ? payload.items : [],
    total_items: Number(payload.total_items || 0),
    total_thb: Number(payload.total_thb || 0),
    total_idr: Number(payload.total_idr || 0),
    status: 'pending',
    created_at: nowIso(),
    updated_at: nowIso()
  };

  items.unshift(order);
  saveOrders(items);
  return order;
}

function updateOrderStatus(id, status) {
  const items = getOrders();
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  items[index].status = status;
  items[index].updated_at = nowIso();
  saveOrders(items);
  return items[index];
}

module.exports = {
  getSettings,
  saveSettings,
  getCategories,
  getProducts,
  getVisibleProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getArticles,
  getVisibleArticles,
  getArticleBySlug,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
};
