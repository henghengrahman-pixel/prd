const express = require('express');
const router = express.Router();
const { baseUrl } = require('../config/app');
const { buildSeo } = require('../helpers/seo');
const { formatDateTime } = require('../helpers/date');
const {
  getSettings,
  getHomepage,
  getPosts,
  getPages,
  getCategories
} = require('../helpers/file-db');

router.get('/', async (req, res) => {
  const settings = await getSettings();
  const homepage = await getHomepage();
  const posts = (await getPosts())
    .filter((post) => post.status === 'published')
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  const seo = buildSeo({
    title: settings.seo?.defaultTitle || settings.siteName,
    description: settings.seo?.defaultDescription || settings.siteTagline,
    image: settings.seo?.defaultOgImage || settings.headerBannerImage,
    canonical: `${baseUrl}/`,
    siteName: settings.siteName
  });

  res.render('home', {
    title: settings.siteName,
    ...seo,
    posts,
    homepage,
    formatDateTime
  });
});

router.get('/artikel/:slug', async (req, res) => {
  const settings = await getSettings();
  const posts = await getPosts();
  const post = posts.find((item) => item.slug === req.params.slug && item.status === 'published');
  if (!post) return res.status(404).render('404', { title: '404', metaTitle: '404', metaDescription: 'Artikel tidak ditemukan.', canonical: `${baseUrl}${req.originalUrl}` });

  const categories = await getCategories();
  const postCategories = categories.filter((category) => post.categoryIds.includes(category.id));
  const seo = buildSeo({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.ogImage || post.thumbnail,
    canonical: `${baseUrl}/artikel/${post.slug}`,
    siteName: settings.siteName
  });

  res.render('post-detail', {
    title: post.title,
    ...seo,
    post,
    postCategories,
    formatDateTime
  });
});

router.get('/kategori/:slug', async (req, res) => {
  const settings = await getSettings();
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === req.params.slug);
  if (!category) return res.status(404).render('404', { title: '404', metaTitle: '404', metaDescription: 'Kategori tidak ditemukan.', canonical: `${baseUrl}${req.originalUrl}` });

  const posts = (await getPosts()).filter((post) => post.status === 'published' && post.categoryIds.includes(category.id));
  const seo = buildSeo({
    title: category.name,
    description: category.description,
    canonical: `${baseUrl}/kategori/${category.slug}`,
    siteName: settings.siteName
  });

  res.render('category', {
    title: category.name,
    ...seo,
    category,
    posts,
    formatDateTime
  });
});

router.get('/halaman/:slug', async (req, res) => {
  const settings = await getSettings();
  const pages = await getPages();
  const page = pages.find((item) => item.slug === req.params.slug && item.status === 'published');
  if (!page) return res.status(404).render('404', { title: '404', metaTitle: '404', metaDescription: 'Halaman tidak ditemukan.', canonical: `${baseUrl}${req.originalUrl}` });

  const seo = buildSeo({
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.title,
    canonical: `${baseUrl}/halaman/${page.slug}`,
    siteName: settings.siteName
  });

  res.render('page', {
    title: page.title,
    ...seo,
    page
  });
});

module.exports = router;
