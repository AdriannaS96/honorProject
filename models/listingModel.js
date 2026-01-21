// models/listingModel.js
const nedb = require("gray-nedb");

class ListingDAO {
  constructor() {
    this.db = new nedb({ filename: "listing.db", autoload: true });
  }

  // ==================== ADD LISTING ====================
  async add({ title, location, area, postcode, price, description, status, landlord, images }) {
    const entry = {
      title,
      location,
      area,
      postcode,
      price,
      description,
      status,
      landlord,
      images,
      createdAt: new Date()
    };
    await this.db.insert(entry);
    return entry;
  }

  // ==================== GET ALL ====================
  async getAll() {
    return new Promise((resolve, reject) => {
      this.db.find({}).sort({ createdAt: -1 }).exec((err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
  }

  // ==================== GET BY LANDLORD ====================
  async getByLandlord(landlord) {
    return new Promise((resolve, reject) => {
      this.db.find({ landlord }).sort({ createdAt: -1 }).exec((err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
  }

  // ==================== GET BY ID ====================
  async getById(id) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ _id: id }, (err, doc) => {
        if (err) reject(err);
        else resolve(doc);
      });
    });
  }

  // ==================== REMOVE ====================
  async remove(id) {
    return new Promise((resolve, reject) => {
      this.db.remove({ _id: id }, {}, (err, numRemoved) => {
        if (err) reject(err);
        else resolve(numRemoved);
      });
    });
  }

// ==================== SEARCH ====================
async search({ location, area, postcode, minPrice, maxPrice }, callback) {
  const query = {};

  if (typeof location === "string" && location.trim() !== "") {
    query.location = new RegExp(location.trim(), "i");
  }

  if (typeof area === "string" && area.trim() !== "") {
    query.area = new RegExp(area.trim(), "i");
  }

  if (typeof postcode === "string" && postcode.trim() !== "") {
    query.postcode = new RegExp(postcode.trim(), "i");
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice && !isNaN(minPrice)) query.price.$gte = Number(minPrice);
    if (maxPrice && !isNaN(maxPrice)) query.price.$lte = Number(maxPrice);
  }

  this.db.find(query).sort({ price: 1 }).exec(callback);
}

}

module.exports = new ListingDAO();
