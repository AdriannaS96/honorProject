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

/**
 * send messages
 */
function sendMessage(from, to, content, cb) {
  const msg = {
    from,
    to,
    content,
    createdAt: new Date(),
    read: false 
  };

  db.insert(msg, cb);
}

/**
 * unread messages 
 */
function countUnread(username, cb) {
  db.find({ to: username, read: false }, (err, docs) => {
    if (err) return cb(err);
    cb(null, docs.length);
  });
}


function markAsRead(from, to, cb) {
  db.update(
    { from, to, read: false }, 
    { $set: { read: true } },
    { multi: true }, 
    cb
  );
}

function markAllAsRead(toUsername, cb) {
  db.update(
    { to: toUsername, read: false },
    { $set: { read: true } },
    { multi: true },
    cb
  );
}


module.exports = {
  getUserConversations,
  getConversation,
  sendMessage,
  countUnread,
  markAsRead,
  markAllAsRead
};