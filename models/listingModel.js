// models/listingModel.js
const nedb = require("gray-nedb");

class ListingDAO {
  constructor() {
    this.db = new nedb({ filename: "listing.db", autoload: true });
  }

  async add({ title, location, price, description, status, landlord, images }) {
    const entry = { title, location, price, description, status, landlord, images, createdAt: new Date() };
    await this.db.insert(entry);
    return entry;
  }

  async getAll() {
    return new Promise((resolve, reject) => {
      this.db.find({}).sort({ createdAt: -1 }).exec((err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
  }

  async getByLandlord(landlord) {
    return new Promise((resolve, reject) => {
      this.db.find({ landlord }).sort({ createdAt: -1 }).exec((err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
  }

  async getById(id) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ _id: id }, (err, doc) => {
        if (err) reject(err);
        else resolve(doc);
      });
    });
  }

  async remove(id) {
    return new Promise((resolve, reject) => {
      this.db.remove({ _id: id }, {}, (err, numRemoved) => {
        if (err) reject(err);
        else resolve(numRemoved);
      });
    });
  }
}

module.exports = new ListingDAO();
