require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const fs = require('fs-extra');

const { DATA_DIR, PUBLIC_DIR, VIEWS_DIR } = require('./config/paths');
const { adminPath, baseUrl, appName, isProduction } = require('./config/app');
const { seedDataIfMissing } = require('./helpers/file-db');
const localsMiddleware = require('./middleware/locals');

const siteRoutes = require('./routes/site');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const systemRoutes = require('./routes/system');

async function bootstrap() {
  await fs.ensureDir(DATA_DIR);
  await fs.ensureDir(path.join(PUBLIC_DIR, 'uploads'));
  await seedDataIfMissing();

  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', VIEWS_DIR);
  app.set('trust proxy', 1);

  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(express.json({ limit: '5mb' }));

  app.use(session({
    secret: process.env.SESSION_SECRET || 'development-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false
    }
  }));

  app.use(flash());
  app.use(express.static(PUBLIC_DIR, { maxAge: isProduction ? '7d' : 0 }));
  app.use(localsMiddleware);

  app.use('/', systemRoutes);

  // admin harus di atas siteRoutes
  app.use(`/${adminPath}`, authRoutes);
  app.use(`/${adminPath}`, adminRoutes);

  app.use('/', siteRoutes);

  app.use((req, res) => {
    res.status(404).render('404', {
      title: '404 Not Found',
      metaTitle: `404 | ${appName}`,
      metaDescription: 'Halaman tidak ditemukan.',
      canonical: `${baseUrl}${req.originalUrl}`
    });
  });

  app.use((err, req, res, next) => {
    console.error('APP ERROR:', err);
    res.status(500).send(`<pre>${err.stack}</pre>`);
  });

  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Admin path: /${adminPath}`);
    console.log(`DATA_DIR: ${DATA_DIR}`);
  });
}

bootstrap().catch((error) => {
  console.error('BOOTSTRAP ERROR:', error);
  process.exit(1);
});
