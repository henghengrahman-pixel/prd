require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const { ensureDataFiles } = require('./helpers/jsonDb');
const { viewGlobals } = require('./middleware');

ensureDataFiles();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false }
}));
app.use('/assets', express.static(path.join(__dirname, 'public')));
app.use(viewGlobals);

app.use('/', require('./routes/system'));
app.use('/', require('./routes/site'));
app.use('/admin', require('./routes/admin'));

app.use((req, res) => {
  res.status(404).render('404');
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render('500', { error });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
