const Datastore = require("gray-nedb");
const db = new Datastore({ filename: "messages.db", autoload: true });

/**
 * Pobiera listę użytkowników, z którymi miałeś rozmowy
 */
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

/**
 * Pobiera wszystkie wiadomości między dwoma użytkownikami
 */
function getConversation(me, otherUser, cb) {
  db.find({
    $or: [
      { from: me, to: otherUser },
      { from: otherUser, to: me }
    ]
  }).sort({ createdAt: 1 }).exec(cb);
}

/**
 * Wysyła wiadomość
 */
function sendMessage(from, to, content, cb) {
  const msg = {
    from,
    to,
    content,
    createdAt: new Date(),
    read: false // flaga nieprzeczytanej wiadomości
  };

  db.insert(msg, cb);
}

/**
 * Liczy nieprzeczytane wiadomości dla użytkownika
 */
function countUnread(username, cb) {
  db.find({ to: username, read: false }, (err, docs) => {
    if (err) return cb(err);
    cb(null, docs.length);
  });
}

/**
 * Oznacza wszystkie wiadomości od innego użytkownika jako przeczytane
 */
function markAsRead(from, to, cb) {
  db.update(
    { from, to, read: false }, // tylko nieprzeczytane wiadomości od "from" do "to"
    { $set: { read: true } },
    { multi: true }, // zmiana wielu rekordów naraz
    cb
  );
}
/**
 * Oznacza wszystkie wiadomości do użytkownika jako przeczytane
 */
function markAllAsRead(toUsername, cb) {
  db.update(
    { to: toUsername, read: false }, // wszystkie nieprzeczytane wiadomości do użytkownika
    { $set: { read: true } },
    { multi: true }, // aktualizuje wiele dokumentów naraz
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