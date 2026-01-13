//models/listingModel.js
const fs = require("fs");
const path = require("path");

class Listing {
    constructor() {
        this.listings = []; // pusta tablica, wszystko dodawane przez użytkownika
        this.nextId = 1;    // do automatycznego numerowania listingów
    }

    // Pobierz wszystkie listingi
    getAll() {
        return this.listings;
    }

    // Pobierz listingi konkretnego landlord
    getByLandlord(landlord) {
        return this.listings.filter(l => l.landlord === landlord);
    }

    // Pobierz listing po id
    getById(id) {
        return this.listings.find(l => l.id === id);
    }

    // Dodaj nowy listing
    add({ title, location, price, description, status, landlord, images }) {
        const newListing = {
            id: this.nextId++,
            title,
            location,
            price,
            description,
            status,
            landlord,
            images, // tablica ścieżek do zdjęć
            createdAt: new Date()
        };
        this.listings.push(newListing);
        return newListing;
    }

    // Aktualizuj listing
    update(id, data) {
        const listing = this.getById(id);
        if (!listing) return false;
        Object.assign(listing, data);
        return true;
    }

    // Usuń listing
    remove(id) {
        const index = this.listings.findIndex(l => l.id === id);
        if (index === -1) return false;

        // opcjonalnie: usuń pliki zdjęć z folderu
        const listing = this.listings[index];
        if (listing.images && listing.images.length > 0) {
            listing.images.forEach(imgPath => {
                const fullPath = path.join(__dirname, "..", "public", imgPath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            });
        }

        this.listings.splice(index, 1);
        return true;
    }
}

module.exports = new Listing();
