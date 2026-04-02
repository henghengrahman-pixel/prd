function buildSeo({ title, description, image, canonical, siteName }) {
  return {
    metaTitle: title ? `${title} | ${siteName}` : siteName,
    metaDescription: description || siteName,
    ogImage: image || '/images/default-banner.svg',
    canonical
  };
}

module.exports = { buildSeo };
