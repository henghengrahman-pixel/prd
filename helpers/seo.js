const { stripHtml } = require('./format');

function makeMeta({ title, description, image, url, keywords }, settings) {
  const defaults = settings?.seo || {};
  const storeName = settings?.storeName || process.env.APP_NAME || 'Store';
  const metaTitle = title ? `${title} | ${storeName}` : (defaults.metaTitle || storeName);
  const metaDescription = description || defaults.metaDescription || storeName;
  const ogImage = image || defaults.ogImage || '';
  return {
    title: metaTitle,
    description: stripHtml(metaDescription),
    image: ogImage,
    url: url || '',
    keywords: keywords || defaults.keywords || ''
  };
}

module.exports = { makeMeta };
