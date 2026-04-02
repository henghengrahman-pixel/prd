const { getVisibleProducts, getProductBySlug, getVisibleArticles, getArticleBySlug } = require('../helpers/store');
const { makeMeta } = require('../helpers/seo');

function home(req, res) {
  const products = getVisibleProducts();
  const featured = products.filter(item => item.featured).slice(0, 8);
  const recommended = products.filter(item => item.recommended).slice(0, 8);
  res.locals.meta = makeMeta({ title: 'Home' }, res.locals.settings);
  res.render('home', { featured, recommended, products, articles: getVisibleArticles().slice(0, 3) });
}

function shop(req, res) {
  const { q = '', category = '' } = req.query;
  let products = getVisibleProducts();
  if (category) products = products.filter(item => item.category.toLowerCase() === String(category).toLowerCase());
  if (q) products = products.filter(item => [item.name, item.brand, item.category, item.short_description].join(' ').toLowerCase().includes(String(q).toLowerCase()));
  res.locals.meta = makeMeta({ title: 'Shop' }, res.locals.settings);
  res.render('shop', { products, query: q, category });
}

function productDetail(req, res, next) {
  const product = getProductBySlug(req.params.slug);
  if (!product) return next();
  const recommended = getVisibleProducts().filter(item => item.slug !== product.slug && (item.recommended || item.category === product.category)).slice(0, 4);
  res.locals.meta = makeMeta({ title: product.name, description: product.short_description, image: product.thumbnail, url: `${res.locals.baseUrl}/product/${product.slug}` }, res.locals.settings);
  res.render('product-detail', { product, recommended });
}

function articles(req, res) {
  const articles = getVisibleArticles();
  res.locals.meta = makeMeta({ title: 'Articles' }, res.locals.settings);
  res.render('articles', { articles });
}

function articleDetail(req, res, next) {
  const article = getArticleBySlug(req.params.slug);
  if (!article) return next();
  res.locals.meta = makeMeta({ title: article.title, description: article.excerpt, image: article.thumbnail, url: `${res.locals.baseUrl}/article/${article.slug}` }, res.locals.settings);
  res.render('article-detail', { article });
}

function contact(req, res) {
  res.locals.meta = makeMeta({ title: 'Contact' }, res.locals.settings);
  res.render('contact');
}

module.exports = { home, shop, productDetail, articles, articleDetail, contact };
