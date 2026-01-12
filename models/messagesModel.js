const Datastore = require("gray-nedb");
const db = new Datastore({ filename: "messages.db", autoload: true });


function getUserConversations(me, cb) {
  db.find({ $or: [{ from: me }, { to: me }] }, (err, docs) => {
    if (err) return cb(err);


    const usersSet = new Set();
    docs.forEach(d => {
      if (d.from !== me) usersSet.add(d.from);
      if (d.to !== me) usersSet.add(d.to);
    });

    cb(null, Array.from(usersSet));
  });
}


function getConversation(me, otherUser, cb) {
  db.find({
    $or: [
      { from: me, to: otherUser },
      { from: otherUser, to: me }
    ]
  }).sort({ createdAt: 1 }).exec(cb);
}

function sendMessage(from, to, content, cb) {
  const msg = {
    from,
    to,
    content,
    createdAt: new Date()
  };

  db.insert(msg, cb);
}

module.exports = {
  getUserConversations,
  getConversation,
  sendMessage
};
