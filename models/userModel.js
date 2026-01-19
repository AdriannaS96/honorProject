const nedb = require("gray-nedb");
const bcrypt = require("bcrypt");
const saltRounds = 10;

class UserDAO {
  constructor() {
    this.db = new nedb({ filename: "user.db", autoload: true });
  }

  async create(username, password, role) {
    const hash = await bcrypt.hash(password, saltRounds);
    const entry = {
      username,
      password: hash,
      role,
      savedListings: [] 
    };
    await this.db.insert(entry);
    return entry;
  }

  findByUsername(username, cb) {
    this.db.findOne({ username }, cb);
  }

  async comparePassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  }

  // ==================  SAVE LISTING ==================
  saveListing(username, listingId, cb) {
    this.db.update(
      { username },
      { $addToSet: { savedListings: listingId } },
      {},
      cb
    );
  }

  removeSavedListing(username, listingId, cb) {
    this.db.update(
      { username },
      { $pull: { savedListings: listingId } },
      {},
      cb
    );
  }

  getSavedListings(username, cb) {
    this.db.findOne({ username }, (err, user) => {
      if (err) return cb(err);
      cb(null, user?.savedListings || []);
    });
  }
}

module.exports = new UserDAO();
