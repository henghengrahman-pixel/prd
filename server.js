require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');

const { ensureDataFiles } = require('./helpers/jsonDb');
const { viewGlobals } = require('./middleware');
const { cartCount } = require('./helpers/cart');

ensureDataFiles();

const app = express();
const PORT = process.env.PORT || 3000;

/* VIEW ENGINE */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* BODY PARSER */
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json());

/* SESSION */
app.use(session({
  name: 'mawar.session',
  secret: process.env.SESSION_SECRET || 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  }
}));

/* STATIC FILES */
app.use('/assets', express.static(path.join(__dirname, 'public')));

/* GLOBAL VARIABLES UNTUK SEMUA VIEW */
app.use((req, res, next) => {
  const cart = req.session.cart || [];

  res.locals.cartCount = cartCount(cart);
  res.locals.baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  res.locals.appName = process.env.APP_NAME || 'Mawar Parfume';

  next();
});

/* VIEW GLOBALS (FLASH, dll) */
app.use(viewGlobals);

/* ROUTES */
app.use('/', require('./routes/system'));
app.use('/', require('./routes/site'));
app.use('/admin', require('./routes/admin'));

/* 404 */
app.use((req, res) => {
  res.status(404).render('404');
});

/* ERROR HANDLER */
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render('500', { error });
});

/* START SERVER */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
