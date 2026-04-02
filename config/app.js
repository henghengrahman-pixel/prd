const appName = 'Neutral Portal CMS';
const adminPath = (process.env.ADMIN_PATH || 'itsiregar808').replace(/^\/+|\/+$/g, '');
const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  appName,
  adminPath,
  baseUrl,
  isProduction
};
