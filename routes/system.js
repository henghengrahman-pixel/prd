const express = require('express');
const router = express.Router();
const { baseUrl } = require('../config/app');
const { getPosts, getPages } = require('../helpers/file-db');

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);
});

router.get('/sitemap.xml', async (req, res) => {
  const posts = (await getPosts()).filter((post) => post.status === 'published');
  const pages = (await getPages()).filter((page) => page.status === 'published');
  const urls = [
    `${baseUrl}/`,
    ...posts.map((post) => `${baseUrl}/artikel/${post.slug}`),
    ...pages.map((page) => `${baseUrl}/halaman/${page.slug}`)
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>`;
  res.type('application/xml').send(xml);
});

module.exports = router;
