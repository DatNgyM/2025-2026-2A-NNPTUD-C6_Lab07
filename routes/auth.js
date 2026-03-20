const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userController = require('../controllers/users');
const { checkLogin } = require('../utils/authHandler');
const { loadPrivateKey, signOptions } = require('../utils/jwtRs256');
const {
  RegisterValidator,
  ChangePasswordValidator,
  handleResultValidator
} = require('../utils/validatorHandler');

/** Dang ky */
router.post(
  '/register',
  RegisterValidator,
  handleResultValidator,
  async (req, res) => {
    const newUser = userController.CreateAnUser(
      req.body.username,
      req.body.password,
      req.body.email,
      '69aa8360450df994c1ce6c4c'
    );
    await newUser.save();
    res.json({ message: 'Dang ky thanh cong' });
  }
);

/** Dang nhap — tra ve JWT (RS256) */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await userController.FindByUsername(username);
  if (!user) {
    return res.status(403).json({ message: 'Tai khoan khong ton tai' });
  }
  if (user.lockTime && user.lockTime > Date.now()) {
    return res.status(403).json({ message: 'Tai khoan dang bi khoa tam thoi' });
  }
  if (!bcrypt.compareSync(password, user.password)) {
    await userController.FailLogin(user);
    return res.status(403).json({ message: 'Sai mat khau' });
  }
  await userController.SuccessLogin(user);
  const token = jwt.sign({ id: user._id.toString() }, loadPrivateKey(), signOptions);
  res.json({ token });
});

/** Thong tin user hien tai — can Bearer token */
router.get('/me', checkLogin, (req, res) => {
  const u = req.user.toObject ? req.user.toObject() : req.user;
  delete u.password;
  res.json(u);
});

/** Doi mat khau — can Bearer + oldpassword + newpassword (validate new) */
router.post(
  '/changepassword',
  checkLogin,
  ChangePasswordValidator,
  handleResultValidator,
  async (req, res) => {
    const { oldpassword, newpassword } = req.body;
    const user = await userController.FindById(req.user._id);
    if (!user) {
      return res.status(403).json({ message: 'Khong tim thay user' });
    }
    if (!bcrypt.compareSync(oldpassword, user.password)) {
      return res.status(400).json({ message: 'Mat khau cu khong dung' });
    }
    await userController.UpdatePassword(user._id, newpassword);
    res.json({ message: 'Doi mat khau thanh cong' });
  }
);

module.exports = router;
