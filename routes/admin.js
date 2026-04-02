const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const requireAdmin = require('../middleware/auth');
const upload = require('../middleware/upload');
const { PUBLIC_DIR } = require('../config/paths');
const {
  id,
  makeSlug,
  getSettings,
  getHomepage,
  getCategories,
  getPosts,
  getPages,
  getMedia,
  saveSettings,
  saveHomepage,
  saveCategories,
  savePosts,
  savePages,
  saveMedia
} = require('../helpers/file-db');

const router = express.Router();
router.use(requireAdmin);

function normalizeAsset(req, fileField, bodyField, fallback = '') {
  if (req.files?.[fileField]?.[0]) return `/uploads/${req.files[fileField][0].filename}`;
  return req.body[bodyField] || fallback;
}

router.get('/dashboard', async (req, res) => {
  const [posts, pages, categories, media] = await Promise.all([getPosts(), getPages(), getCategories(), getMedia()]);
  res.render('admin/dashboard', {
    title: 'Dashboard',
    stats: {
      posts: posts.length,
      pages: pages.length,
      categories: categories.length,
      media: media.length
    }
  });
});

router.get('/settings', async (req, res) => {
  const settings = await getSettings();
  const homepage = await getHomepage();
  res.render('admin/settings', { title: 'Settings', settings, homepage });
});

router.post('/settings', upload.fields([
  { name: 'logoFile', maxCount: 1 },
  { name: 'faviconFile', maxCount: 1 },
  { name: 'headerBannerImageFile', maxCount: 1 },
  { name: 'headerBannerGifFile', maxCount: 1 },
  { name: 'backgroundImageFile', maxCount: 1 }
]), async (req, res) => {
  const current = await getSettings();
  const settings = {
    ...current,
    siteName: req.body.siteName,
    siteTagline: req.body.siteTagline,
    logo: normalizeAsset(req, 'logoFile', 'logo', current.logo),
    favicon: normalizeAsset(req, 'faviconFile', 'favicon', current.favicon),
    headerBannerType: req.body.headerBannerType,
    headerBannerImage: normalizeAsset(req, 'headerBannerImageFile', 'headerBannerImage', current.headerBannerImage),
    headerBannerGif: normalizeAsset(req, 'headerBannerGifFile', 'headerBannerGif', current.headerBannerGif),
    backgroundType: req.body.backgroundType,
    backgroundImage: normalizeAsset(req, 'backgroundImageFile', 'backgroundImage', current.backgroundImage),
    backgroundColor: req.body.backgroundColor,
    primaryColor: req.body.primaryColor,
    secondaryColor: req.body.secondaryColor,
    footerText: req.body.footerText,
    seo: {
      defaultTitle: req.body.defaultTitle,
      defaultDescription: req.body.defaultDescription,
      defaultOgImage: req.body.defaultOgImage || current.seo?.defaultOgImage || current.headerBannerImage
    }
  };
  await saveSettings(settings);
  req.flash('success', 'Pengaturan berhasil disimpan.');
  res.redirect(`${req.baseUrl}/settings`);
});

router.post('/homepage', async (req, res) => {
  const items = [];
  const times = Array.isArray(req.body.itemTime) ? req.body.itemTime : [req.body.itemTime].filter(Boolean);
  const names = Array.isArray(req.body.itemName) ? req.body.itemName : [req.body.itemName].filter(Boolean);
  const notes = Array.isArray(req.body.itemNote) ? req.body.itemNote : [req.body.itemNote].filter(Boolean);
  const lastResults = Array.isArray(req.body.itemLastResult) ? req.body.itemLastResult : [req.body.itemLastResult].filter(Boolean);
  const max = Math.max(times.length, names.length, notes.length, lastResults.length);

  for (let i = 0; i < max; i += 1) {
    if (!times[i] && !names[i]) continue;
    items.push({
      time: times[i] || '',
      name: names[i] || '',
      note: notes[i] || '',
      lastResult: lastResults[i] || '-'
    });
  }

  await saveHomepage({
    sidebarTitle: req.body.sidebarTitle || 'Jadwal Informasi',
    sidebarItems: items
  });

  req.flash('success', 'Homepage berhasil diperbarui.');
  res.redirect(`${req.baseUrl}/settings`);
});

router.get('/posts', async (req, res) => {
  const posts = await getPosts();
  res.render('admin/posts', { title: 'Posts', posts });
});

router.post('/posts', upload.single('thumbnailFile'), async (req, res) => {
  const posts = await getPosts();
  posts.unshift({
    id: id('post'),
    title: req.body.title,
    slug: makeSlug(req.body.slug || req.body.title),
    excerpt: req.body.excerpt,
    content: req.body.content,
    thumbnail: req.file ? `/uploads/${req.file.filename}` : (req.body.thumbnail || '/images/post-1.svg'),
    categoryIds: (req.body.categoryIds || '').split(',').map((x) => x.trim()).filter(Boolean),
    status: req.body.status || 'published',
    publishedAt: new Date().toISOString(),
    seoTitle: req.body.seoTitle || req.body.title,
    seoDescription: req.body.seoDescription || req.body.excerpt,
    ogImage: req.body.ogImage || (req.file ? `/uploads/${req.file.filename}` : '/images/post-1.svg')
  });
  await savePosts(posts);
  req.flash('success', 'Artikel berhasil ditambahkan.');
  res.redirect(`${req.baseUrl}/posts`);
});

router.post('/posts/:id/delete', async (req, res) => {
  const posts = await getPosts();
  await savePosts(posts.filter((post) => post.id !== req.params.id));
  req.flash('success', 'Artikel berhasil dihapus.');
  res.redirect(`${req.baseUrl}/posts`);
});

router.get('/categories', async (req, res) => {
  const categories = await getCategories();
  res.render('admin/categories', { title: 'Categories', categories });
});

router.post('/categories', async (req, res) => {
  const categories = await getCategories();
  categories.unshift({
    id: id('cat'),
    name: req.body.name,
    slug: makeSlug(req.body.slug || req.body.name),
    description: req.body.description
  });
  await saveCategories(categories);
  req.flash('success', 'Kategori berhasil ditambahkan.');
  res.redirect(`${req.baseUrl}/categories`);
});

router.post('/categories/:id/delete', async (req, res) => {
  const categories = await getCategories();
  await saveCategories(categories.filter((category) => category.id !== req.params.id));
  req.flash('success', 'Kategori berhasil dihapus.');
  res.redirect(`${req.baseUrl}/categories`);
});

router.get('/pages', async (req, res) => {
  const pages = await getPages();
  res.render('admin/pages', { title: 'Pages', pages });
});

router.post('/pages', async (req, res) => {
  const pages = await getPages();
  pages.unshift({
    id: id('page'),
    title: req.body.title,
    slug: makeSlug(req.body.slug || req.body.title),
    content: req.body.content,
    status: req.body.status || 'published',
    seoTitle: req.body.seoTitle || req.body.title,
    seoDescription: req.body.seoDescription || req.body.title
  });
  await savePages(pages);
  req.flash('success', 'Halaman berhasil ditambahkan.');
  res.redirect(`${req.baseUrl}/pages`);
});

router.post('/pages/:id/delete', async (req, res) => {
  const pages = await getPages();
  await savePages(pages.filter((page) => page.id !== req.params.id));
  req.flash('success', 'Halaman berhasil dihapus.');
  res.redirect(`${req.baseUrl}/pages`);
});

router.get('/media', async (req, res) => {
  const media = await getMedia();
  res.render('admin/media', { title: 'Media', media });
});

router.post('/media', upload.array('mediaFiles', 10), async (req, res) => {
  const media = await getMedia();
  for (const file of req.files || []) {
    media.unshift({
      id: id('media'),
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      type: file.mimetype,
      size: file.size,
      createdAt: new Date().toISOString()
    });
  }
  await saveMedia(media);
  req.flash('success', 'Media berhasil diupload.');
  res.redirect(`${req.baseUrl}/media`);
});

router.post('/media/:id/delete', async (req, res) => {
  const media = await getMedia();
  const item = media.find((entry) => entry.id === req.params.id);
  if (item) {
    const target = path.join(PUBLIC_DIR, item.url.replace(/^\//, ''));
    await fs.remove(target).catch(() => {});
  }
  await saveMedia(media.filter((entry) => entry.id !== req.params.id));
  req.flash('success', 'Media berhasil dihapus.');
  res.redirect(`${req.baseUrl}/media`);
});

module.exports = router;
