const messageDAO = require('../models/messageModel');

exports.sendMessage = (req, res) => {
    const message = {
        from: req.body.from,
        to: req.body.to,
        content: req.body.content,
        createdAt: new Date()
    };

    messageDAO.send(message, () => {
        res.redirect('back');
    });
};
