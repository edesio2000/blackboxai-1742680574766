// In-memory storage for farmers
let farmers = [];
let nextId = 1;

class Farmer {
    constructor(data) {
        this.id = nextId++;
        this.name = data.name;
        this.address = data.address;
        this.phone = data.phone;
        this.email = data.email || '';
        this.landSize = Number(data.landSize);
        this.cropTypes = Array.isArray(data.cropTypes) ? data.cropTypes : [];
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    static create(data) {
        const farmer = new Farmer(data);
        farmers.push(farmer);
        return farmer;
    }

    static getAll() {
        return farmers;
    }

    static findById(id) {
        const numId = Number(id);
        return farmers.find(farmer => farmer.id === numId);
    }

    static update(id, data) {
        const numId = Number(id);
        const index = farmers.findIndex(farmer => farmer.id === numId);
        if (index === -1) return null;

        const existingFarmer = farmers[index];
        const updatedFarmer = {
            ...existingFarmer,
            ...data,
            id: numId, // Prevent ID from being modified
            landSize: Number(data.landSize),
            cropTypes: Array.isArray(data.cropTypes) ? data.cropTypes : existingFarmer.cropTypes,
            updatedAt: new Date()
        };

        farmers[index] = updatedFarmer;
        return updatedFarmer;
    }

    static delete(id) {
        const numId = Number(id);
        const index = farmers.findIndex(farmer => farmer.id === numId);
        if (index === -1) return false;

        farmers.splice(index, 1);
        return true;
    }

    static search(query) {
        if (!query) return farmers;

        query = query.toLowerCase();
        return farmers.filter(farmer => 
            farmer.name.toLowerCase().includes(query) ||
            farmer.address.toLowerCase().includes(query) ||
            farmer.phone.includes(query) ||
            (farmer.email && farmer.email.toLowerCase().includes(query)) ||
            farmer.cropTypes.some(crop => crop.toLowerCase().includes(query))
        );
    }
}

module.exports = Farmer;