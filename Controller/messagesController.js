//messagesController.js
exports.sendMessage = (req, res) => {
  const from = req.session.user.username;
  const { to, content } = req.body;

  if (!to || !content.trim()) {
    return res.redirect("back");
  }

  messageDAO.sendMessage(from, to, content);
  res.redirect("back");
};
