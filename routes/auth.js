const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  if (req.session?.isAdmin) return res.redirect(`${req.baseUrl}/dashboard`);
  res.render('admin/login', {
    title: 'Admin Login',
    metaTitle: 'Admin Login',
    metaDescription: 'Login admin',
    canonical: ''
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.ADMIN_USER || 'admin';
  const validPass = process.env.ADMIN_PASS || 'changeme';

  if (username === validUser && password === validPass) {
    req.session.isAdmin = true;
    req.flash('success', 'Login berhasil.');
    return res.redirect(`${req.baseUrl}/dashboard`);
  }

  req.flash('error', 'Username atau password salah.');
  return res.redirect(req.baseUrl);
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect(req.baseUrl);
  });
});

module.exports = router;
