const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('./constants');
const { slugify } = require('./slug');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJsonAtomic(filePath, data) {
  ensureDir(path.dirname(filePath));
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, filePath);
}

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) {
      writeJsonAtomic(filePath, fallback);
      return structuredClone(fallback);
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) {
      writeJsonAtomic(filePath, fallback);
      return structuredClone(fallback);
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to read JSON: ${filePath}`, error);
    return structuredClone(fallback);
  }
}

function getFilePath(fileName) {
  return path.join(DATA_DIR, fileName);
}

function nowIso() {
  return new Date().toISOString();
}

function defaultSettings() {
  return {
    storeName: process.env.APP_NAME || 'My Online Store',
    logo: 'https://dummyimage.com/180x50/ffffff/d10024&text=STORE',
    whatsapp: '+6280000000000',
    phone: '+66 000 000 000',
    email: 'hello@example.com',
    address: 'Poipet, Cambodia',
    seo: {
      metaTitle: process.env.APP_NAME || 'My Online Store',
      metaDescription: 'Online shop with product catalog, cart, checkout, and admin panel.',
      ogImage: 'https://dummyimage.com/1200x630/f5f5f5/333333&text=Online+Store',
      keywords: 'online store, ecommerce, poipet, shop'
    }
  };
}

function defaultCategories() {
  return [
    { id: 'cat-fashion', name: 'Fashion', slug: 'fashion', visible: true },
    { id: 'cat-beauty', name: 'Beauty', slug: 'beauty', visible: true },
    { id: 'cat-electronic', name: 'Electronic', slug: 'electronic', visible: true }
  ];
}

function defaultProducts() {
  const now = nowIso();
  return [
    {
      id: 'prd-001',
      name: 'Premium Store Product 1',
      slug: 'premium-store-product-1',
      category: 'Fashion',
      brand: 'Electro',
      status: 'ready',
      price_thb: 990,
      price_idr: 459000,
      compare_price_thb: 1200,
      compare_price_idr: 525000,
      thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
      ],
      short_description: 'Produk contoh untuk homepage dan detail page.',
      description: '<p>Deskripsi lengkap produk contoh. Anda bisa edit dari admin panel.</p>',
      details: '<ul><li>Bahan premium</li><li>Siap kirim</li><li>Cocok untuk toko demo</li></ul>',
      featured: true,
      recommended: true,
      visible: true,
      created_at: now,
      updated_at: now
    },
    {
      id: 'prd-002',
      name: 'Premium Store Product 2',
      slug: 'premium-store-product-2',
      category: 'Beauty',
      brand: 'Electro',
      status: 'ready',
      price_thb: 850,
      price_idr: 389000,
      compare_price_thb: 0,
      compare_price_idr: 0,
      thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      images: [
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
      ],
      short_description: 'Produk contoh kedua.',
      description: '<p>Produk contoh kedua dengan layout template yang tetap sama.</p>',
      details: '<ul><li>Image URL</li><li>Tanpa database</li></ul>',
      featured: true,
      recommended: true,
      visible: true,
      created_at: now,
      updated_at: now
    },
    {
      id: 'prd-003',
      name: 'Sold Out Example Product',
      slug: 'sold-out-example-product',
      category: 'Electronic',
      brand: 'Electro',
      status: 'sold_out',
      price_thb: 1500,
      price_idr: 699000,
      compare_price_thb: 1750,
      compare_price_idr: 799000,
      thumbnail: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
      images: [
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'
      ],
      short_description: 'Contoh produk sold out.',
      description: '<p>Produk sold out tidak bisa checkout.</p>',
      details: '<ul><li>Status sold out</li></ul>',
      featured: false,
      recommended: false,
      visible: true,
      created_at: now,
      updated_at: now
    }
  ];
}

function defaultArticles() {
  const now = nowIso();
  return [
    {
      id: 'art-001',
      title: 'Welcome to Our Store',
      slug: 'welcome-to-our-store',
      excerpt: 'Artikel contoh pertama untuk blog halaman storefront.',
      content: '<p>Ini artikel contoh. Anda bisa ubah dari admin panel.</p>',
      thumbnail: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80',
      visible: true,
      created_at: now,
      updated_at: now
    }
  ];
}

function defaultOrders() { return []; }

const defaults = {
  'settings.json': defaultSettings,
  'categories.json': defaultCategories,
  'products.json': defaultProducts,
  'articles.json': defaultArticles,
  'orders.json': defaultOrders
};

function ensureDataFiles() {
  ensureDir(DATA_DIR);
  Object.entries(defaults).forEach(([fileName, factory]) => {
    const filePath = getFilePath(fileName);
    if (!fs.existsSync(filePath)) {
      writeJsonAtomic(filePath, factory());
    }
  });
}

function getCollection(fileName) {
  ensureDataFiles();
  const factory = defaults[fileName];
  return readJson(getFilePath(fileName), factory ? factory() : []);
}

function saveCollection(fileName, data) {
  writeJsonAtomic(getFilePath(fileName), data);
  return data;
}

function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeProduct(payload = {}, existing = null) {
  const now = nowIso();
  const name = String(payload.name || existing?.name || '').trim();
  const slug = slugify(payload.slug || name || existing?.slug || uid('product'));
  const images = Array.isArray(payload.images)
    ? payload.images
    : String(payload.images || '').split(/\r?\n|,/).map(item => item.trim()).filter(Boolean);
  const thumbnail = String(payload.thumbnail || images[0] || existing?.thumbnail || '').trim();
  return {
    id: existing?.id || payload.id || uid('prd'),
    name,
    slug,
    category: String(payload.category || existing?.category || '').trim(),
    brand: String(payload.brand || existing?.brand || '').trim(),
    status: payload.status === 'sold_out' ? 'sold_out' : 'ready',
    price_thb: Number(payload.price_thb || 0),
    price_idr: Number(payload.price_idr || 0),
    compare_price_thb: Number(payload.compare_price_thb || 0),
    compare_price_idr: Number(payload.compare_price_idr || 0),
    thumbnail,
    images: images.length ? images : (thumbnail ? [thumbnail] : []),
    short_description: String(payload.short_description || existing?.short_description || '').trim(),
    description: String(payload.description || existing?.description || '').trim(),
    details: String(payload.details || existing?.details || '').trim(),
    featured: payload.featured === true || payload.featured === 'on' || payload.featured === 'true',
    recommended: payload.recommended === true || payload.recommended === 'on' || payload.recommended === 'true',
    visible: payload.visible === undefined ? (existing?.visible ?? true) : (payload.visible === true || payload.visible === 'on' || payload.visible === 'true'),
    created_at: existing?.created_at || now,
    updated_at: now
  };
}

function normalizeArticle(payload = {}, existing = null) {
  const now = nowIso();
  const title = String(payload.title || existing?.title || '').trim();
  return {
    id: existing?.id || payload.id || uid('art'),
    title,
    slug: slugify(payload.slug || title || existing?.slug || uid('article')),
    excerpt: String(payload.excerpt || existing?.excerpt || '').trim(),
    content: String(payload.content || existing?.content || '').trim(),
    thumbnail: String(payload.thumbnail || existing?.thumbnail || '').trim(),
    visible: payload.visible === undefined ? (existing?.visible ?? true) : (payload.visible === true || payload.visible === 'on' || payload.visible === 'true'),
    created_at: existing?.created_at || now,
    updated_at: now
  };
}

module.exports = {
  ensureDataFiles,
  getCollection,
  saveCollection,
  uid,
  nowIso,
  normalizeProduct,
  normalizeArticle,
  defaultSettings
};
