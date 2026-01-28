const nedb = require("gray-nedb");
const bcrypt = require("bcrypt");
const saltRounds = 10;

class UserDAO {
  constructor() {
    this.db = new nedb({ filename: "user.db", autoload: true });
  }

  async create(username, email, password, role) {
    const hash = await bcrypt.hash(password, saltRounds);
    const entry = {
      username,
      email,
      password: hash,
      role,
      savedListings: [],
      createdAt: new Date()
    };
    await this.db.insert(entry);
    return entry;
  }

  findByUsername(username, cb) {
    this.db.findOne({ username }, cb);
  }

  findByEmail(email, cb) {
    this.db.findOne({ email }, cb);
  }

  findByUsernameOrEmail(identifier, cb) {
    this.db.findOne({ $or: [{ username: identifier }, { email: identifier }] }, cb);
  }

  async comparePassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  }

  // ================== SAVE LISTING ==================
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

//account
updateEmail(username, email, cb) {
  this.db.update(
    { username },
    { $set: { email } },
    {},
    cb
  );
}

updatePassword(username, password, cb) {
  this.db.update(
    { username },
    { $set: { password } },
    {},
    cb
  );
}


}

module.exports = new UserDAO();
