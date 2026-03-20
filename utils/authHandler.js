const jwt = require('jsonwebtoken');
const userController = require('../controllers/users');
const { loadPublicKey, verifyOptions } = require('./jwtRs256');

/**
 * Bearer JWT — verify RS256 bằng public key.
 */
async function checkLogin(req, res, next) {
  let auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'Chua dang nhap (thiếu Bearer token)' });
  }
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, loadPublicKey(), verifyOptions);
    const user = await userController.FindById(payload.id);
    if (!user) {
      return res.status(403).json({ message: 'Tai khoan khong hop le' });
    }
    req.user = user;
    next();
  } catch (e) {
    return res.status(403).json({ message: 'Token khong hop le hoac het han' });
  }
}

module.exports = { checkLogin };
