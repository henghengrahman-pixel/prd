const { adminPath, baseUrl, appName } = require('../config/app');
const { getSettings, getMenus } = require('../helpers/file-db');

module.exports = async function localsMiddleware(req, res, next) {
  try {
    const settings = await getSettings();
    const menus = await getMenus();
    res.locals.appName = appName;
    res.locals.baseUrl = baseUrl;
    res.locals.adminPath = adminPath;
    res.locals.settings = settings;
    res.locals.menus = menus;
    res.locals.flashError = req.flash('error');
    res.locals.flashSuccess = req.flash('success');
    res.locals.currentPath = req.path;
    next();
  } catch (error) {
    next(error);
  }
};
