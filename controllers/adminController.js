const { ORDER_STATUSES } = require('../helpers/constants');
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getOrders,
  updateOrderStatus,
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleById,
  getSettings,
  saveSettings
} = require('../helpers/store');
const { setFlash } = require('../middleware');

function loginPage(req, res) {
  res.render('admin/login', {
    layout: false,
    flash: req.session.flash || null
  });
  delete req.session.flash;
}

function login(req, res) {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.adminUser = { username };
    return res.redirect('/admin');
  }

  setFlash(req, 'danger', 'Login gagal.');
  return res.redirect('/admin/login');
}

function logout(req, res) {
  req.session.destroy(() => res.redirect('/admin/login'));
}

function dashboard(req, res) {
  res.render('admin/dashboard', {
    totalProducts: getProducts().length,
    totalOrders: getOrders().length,
    totalArticles: getArticles().length,
    recentOrders: getOrders().slice(0, 10)
  });
}

function productList(req, res) {
  res.render('admin/products', { products: getProducts() });
}

function productCreatePage(req, res) {
  res.render('admin/product-form', { item: null });
}

function productStore(req, res) {
  try {
    if (!String(req.body.name || '').trim()) {
      setFlash(req, 'danger', 'Nama produk wajib diisi.');
      return res.redirect('/admin/products/create');
    }

    createProduct(req.body);
    setFlash(req, 'success', 'Produk berhasil dibuat.');
    return res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    setFlash(req, 'danger', 'Gagal menambah produk. Periksa field yang diisi.');
    return res.redirect('/admin/products/create');
  }
}

function productEditPage(req, res) {
  res.render('admin/product-form', {
    item: getProductById(req.params.id) || null
  });
}

function productUpdate(req, res) {
  try {
    if (!String(req.body.name || '').trim()) {
      setFlash(req, 'danger', 'Nama produk wajib diisi.');
      return res.redirect(`/admin/products/${req.params.id}/edit`);
    }

    updateProduct(req.params.id, req.body);
    setFlash(req, 'success', 'Produk berhasil diupdate.');
    return res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    setFlash(req, 'danger', 'Gagal update produk.');
    return res.redirect(`/admin/products/${req.params.id}/edit`);
  }
}

function productDelete(req, res) {
  deleteProduct(req.params.id);
  setFlash(req, 'success', 'Produk berhasil dihapus.');
  res.redirect('/admin/products');
}

function orderList(req, res) {
  res.render('admin/orders', {
    orders: getOrders(),
    statuses: ORDER_STATUSES
  });
}

function orderUpdateStatus(req, res) {
  updateOrderStatus(req.params.id, req.body.status);
  setFlash(req, 'success', 'Status order diupdate.');
  res.redirect('/admin/orders');
}

function articleList(req, res) {
  res.render('admin/articles', { articles: getArticles() });
}

function articleCreatePage(req, res) {
  res.render('admin/article-form', { item: null });
}

function articleStore(req, res) {
  createArticle(req.body);
  setFlash(req, 'success', 'Artikel berhasil dibuat.');
  res.redirect('/admin/articles');
}

function articleEditPage(req, res) {
  res.render('admin/article-form', {
    item: getArticleById(req.params.id) || null
  });
}

function articleUpdate(req, res) {
  updateArticle(req.params.id, req.body);
  setFlash(req, 'success', 'Artikel berhasil diupdate.');
  res.redirect('/admin/articles');
}

function articleDelete(req, res) {
  deleteArticle(req.params.id);
  setFlash(req, 'success', 'Artikel berhasil dihapus.');
  res.redirect('/admin/articles');
}

function settingsPage(req, res) {
  const current = getSettings() || {};

  res.render('admin/settings', {
    settings: {
      ...current,
      telegram: current.telegram || '',
      telegramChannel: current.telegramChannel || '',
      seo: {
        metaTitle: current.seo?.metaTitle || '',
        metaDescription: current.seo?.metaDescription || '',
        ogImage: current.seo?.ogImage || '',
        keywords: current.seo?.keywords || ''
      }
    }
  });
}

function settingsUpdate(req, res) {
  const current = getSettings() || {};

  const payload = {
    storeName: req.body.storeName || '',
    logo: req.body.logo || '',
    whatsapp: req.body.whatsapp || '',
    telegram: req.body.telegram || '',
    telegramChannel: req.body.telegramChannel || '',
    email: req.body.email || '',
    address: req.body.address || '',
    seo: {
      metaTitle: req.body.metaTitle || '',
      metaDescription: req.body.metaDescription || '',
      ogImage: req.body.ogImage || '',
      keywords: req.body.keywords || ''
    }
  };

  saveSettings({
    ...current,
    ...payload
  });

  setFlash(req, 'success', 'Settings berhasil disimpan.');
  res.redirect('/admin/settings');
}

module.exports = {
  loginPage,
  login,
  logout,
  dashboard,
  productList,
  productCreatePage,
  productStore,
  productEditPage,
  productUpdate,
  productDelete,
  orderList,
  orderUpdateStatus,
  articleList,
  articleCreatePage,
  articleStore,
  articleEditPage,
  articleUpdate,
  articleDelete,
  settingsPage,
  settingsUpdate
};
