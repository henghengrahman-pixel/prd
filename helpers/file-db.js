const path = require('path');
const fs = require('fs-extra');
const { DATA_DIR } = require('../config/paths');
const { makeSlug } = require('./slug');

const files = {
  settings: 'settings.json',
  homepage: 'homepage.json',
  menus: 'menus.json',
  categories: 'categories.json',
  posts: 'posts.json',
  pages: 'pages.json',
  media: 'media.json'
};

function filePath(name) {
  return path.join(DATA_DIR, files[name]);
}

async function readJson(name, fallback) {
  const target = filePath(name);
  const exists = await fs.pathExists(target);
  if (!exists) return fallback;
  return fs.readJson(target);
}

async function writeJson(name, value) {
  const target = filePath(name);
  await fs.ensureFile(target);
  await fs.writeJson(target, value, { spaces: 2 });
  return value;
}

function id(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function seedDataIfMissing() {
  const defaults = {
    settings: {
      siteName: 'Neutral Portal CMS',
      siteTagline: 'Portal artikel modern berbasis EJS',
      logo: '/images/default-logo.svg',
      favicon: '/images/default-logo.svg',
      headerBannerType: 'image',
      headerBannerImage: '/images/default-banner.svg',
      headerBannerGif: '',
      backgroundType: 'image',
      backgroundImage: '/images/default-bg.svg',
      backgroundColor: '#101318',
      primaryColor: '#d8a318',
      secondaryColor: '#181d24',
      footerText: 'Neutral Portal CMS',
      seo: {
        defaultTitle: 'Neutral Portal CMS',
        defaultDescription: 'Portal informasi modern, cepat, dan mobile friendly.',
        defaultOgImage: '/images/default-banner.svg'
      }
    },
    homepage: {
      sidebarTitle: 'Jadwal Informasi',
      sidebarItems: [
        { time: '08:00 - 09:00', name: 'Layanan A', note: 'Setiap Hari', lastResult: '-' },
        { time: '10:00 - 10:30', name: 'Layanan B', note: 'Senin - Jumat', lastResult: '-' },
        { time: '13:30 - 13:50', name: 'Layanan C', note: 'Setiap Hari', lastResult: '-' },
        { time: '15:10 - 15:30', name: 'Layanan D', note: 'Setiap Hari', lastResult: '-' }
      ]
    },
    menus: [
      { title: 'Beranda', url: '/' },
      { title: 'Artikel', url: '/kategori/artikel' },
      { title: 'Panduan', url: '/kategori/panduan' },
      { title: 'Tentang', url: '/halaman/tentang-kami' }
    ],
    categories: [
      { id: 'cat_artikel', name: 'Artikel', slug: 'artikel', description: 'Kategori artikel umum' },
      { id: 'cat_panduan', name: 'Panduan', slug: 'panduan', description: 'Kategori panduan' }
    ],
    posts: [
      {
        id: 'post_demo_1',
        title: 'Selamat Datang di Neutral Portal CMS',
        slug: 'selamat-datang-di-neutral-portal-cms',
        excerpt: 'Template awal yang siap dijalankan di Railway dengan EJS, admin path custom, dan penyimpanan JSON di DATA_DIR.',
        content: '<p>Ini adalah artikel demo pertama. Kamu bisa mengedit isi artikel ini dari dashboard admin.</p><p>Struktur proyek ini dibuat agar mudah dipelihara, mobile-friendly, dan cocok untuk portal artikel atau informasi umum.</p>',
        thumbnail: '/images/post-1.svg',
        categoryIds: ['cat_artikel'],
        status: 'published',
        publishedAt: new Date().toISOString(),
        seoTitle: 'Selamat Datang di Neutral Portal CMS',
        seoDescription: 'Artikel demo pertama untuk project starter.',
        ogImage: '/images/post-1.svg'
      },
      {
        id: 'post_demo_2',
        title: 'Cara Mengelola Tampilan dari Admin',
        slug: 'cara-mengelola-tampilan-dari-admin',
        excerpt: 'Logo, banner, background, dan item sidebar bisa diatur dari halaman pengaturan admin.',
        content: '<p>Project ini menyediakan halaman pengaturan untuk mengubah branding utama situs, termasuk banner, background, warna, dan footer.</p>',
        thumbnail: '/images/post-2.svg',
        categoryIds: ['cat_panduan'],
        status: 'published',
        publishedAt: new Date().toISOString(),
        seoTitle: 'Cara Mengelola Tampilan dari Admin',
        seoDescription: 'Panduan mengelola branding dari dashboard admin.',
        ogImage: '/images/post-2.svg'
      }
    ],
    pages: [
      {
        id: 'page_tentang',
        title: 'Tentang Kami',
        slug: 'tentang-kami',
        content: '<p>Ini halaman statis contoh. Kamu bisa mengubahnya dari admin panel.</p>',
        status: 'published',
        seoTitle: 'Tentang Kami',
        seoDescription: 'Halaman tentang kami.'
      }
    ],
    media: []
  };

  for (const [name, value] of Object.entries(defaults)) {
    const target = filePath(name);
    const exists = await fs.pathExists(target);
    if (!exists) await writeJson(name, value);
  }
}

async function getSettings() {
  return readJson('settings', {});
}

async function getHomepage() {
  return readJson('homepage', { sidebarTitle: 'Info', sidebarItems: [] });
}

async function getMenus() {
  return readJson('menus', []);
}

async function getCategories() {
  return readJson('categories', []);
}

async function getPosts() {
  return readJson('posts', []);
}

async function getPages() {
  return readJson('pages', []);
}

async function getMedia() {
  return readJson('media', []);
}

async function saveSettings(data) { return writeJson('settings', data); }
async function saveHomepage(data) { return writeJson('homepage', data); }
async function saveMenus(data) { return writeJson('menus', data); }
async function saveCategories(data) { return writeJson('categories', data); }
async function savePosts(data) { return writeJson('posts', data); }
async function savePages(data) { return writeJson('pages', data); }
async function saveMedia(data) { return writeJson('media', data); }

module.exports = {
  files,
  id,
  makeSlug,
  seedDataIfMissing,
  getSettings,
  getHomepage,
  getMenus,
  getCategories,
  getPosts,
  getPages,
  getMedia,
  saveSettings,
  saveHomepage,
  saveMenus,
  saveCategories,
  savePosts,
  savePages,
  saveMedia
};
