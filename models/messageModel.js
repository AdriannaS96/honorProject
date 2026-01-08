const Datastore = require('gray-nedb');

class MessageDAO {
    constructor() {
        this.db = new Datastore({
            filename: './data/messages.db',
            autoload: true
        });
    }

    send(message, cb) {
        this.db.insert(message, cb);
    }

    getConversation(user1, user2, cb) {
        this.db.find({
            $or: [
                { from: user1, to: user2 },
                { from: user2, to: user1 }
            ]
        }).sort({ createdAt: 1 }).exec(cb);
    }
}

module.exports = new MessageDAO();
