// models/messagesModel.js

const messages = [];

/*
message = {
  from: "username",
  to: "username",
  text: "hello",
  timestamp: Date
}
*/

function sendMessage(from, to, text) {
  messages.push({
    from,
    to,
    text,
    timestamp: new Date()
  });
}

function getConversation(user1, user2) {
  return messages.filter(
    m =>
      (m.from === user1 && m.to === user2) ||
      (m.from === user2 && m.to === user1)
  );
}

function getUserConversations(username) {
  const users = new Set();

  messages.forEach(m => {
    if (m.from === username) users.add(m.to);
    if (m.to === username) users.add(m.from);
  });

  return Array.from(users);
}

module.exports = {
  sendMessage,
  getConversation,
  getUserConversations
};
