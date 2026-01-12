//models/listingModel.js
class Listing {
    constructor() {
        this.listings = [
            { id: 1, title: "Flat A", location: "Glasgow", status: "Active", landlord: "John Doe" },
            { id: 2, title: "Flat B", location: "Edinburgh", status: "Pending", landlord: "John Doe" },
        ];
    }
    getAll() {
        return this.listings;
    }
    getByLandlord(landlord) {
        return this.listings.filter(l => l.landlord === landlord);
    }

    add(listing) {
        const id = this.listings.length + 1;
        this.listings.push({ id, ...listing });
        return id;
    }


    getById(id) {
        return this.listings.find(l => l.id === id);
    }


    remove(id) {
        this.listings = this.listings.filter(l => l.id !== id);
    }


    update(id, data) {
        const listing = this.getById(id);
        if(listing) {
            Object.assign(listing, data);
            return true;
        }
        return false;
    }
}

module.exports = new Listing();
