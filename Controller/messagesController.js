//Controller/messagesController.js
const messageDAO = require('../models/messagesModel');

exports.sendMessage = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const from = req.session.user.username;
  const { to, content } = req.body;

  if (!to || !content.trim()) {
    return res.redirect('back');
  }

  messageDAO.sendMessage(from, to, content);
  res.redirect('back');
};
