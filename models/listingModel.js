//models/listingModel.js
class Listing {
    constructor() {
        // Tymczasowo trzymamy listings w pamięci
        this.listings = [
            { id: 1, title: "Flat A", location: "Glasgow", status: "Active", landlord: "John Doe" },
            { id: 2, title: "Flat B", location: "Edinburgh", status: "Pending", landlord: "John Doe" },
        ];
    }

    // Pobierz wszystkie listingi
    getAll() {
        return this.listings;
    }

    // Pobierz listing po landlordzie
    getByLandlord(landlord) {
        return this.listings.filter(l => l.landlord === landlord);
    }

    // Dodaj nowy listing
    add(listing) {
        const id = this.listings.length + 1;
        this.listings.push({ id, ...listing });
        return id;
    }

    // Znajdź listing po id
    getById(id) {
        return this.listings.find(l => l.id === id);
    }

    // Usuń listing
    remove(id) {
        this.listings = this.listings.filter(l => l.id !== id);
    }

    // Edytuj listing
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
