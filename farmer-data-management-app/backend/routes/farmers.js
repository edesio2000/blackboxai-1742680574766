const express = require('express');
const router = express.Router();
const Farmer = require('../models/farmer');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');

// Validate farmer data
const validateFarmerData = (data) => {
    const requiredFields = ['name', 'address', 'phone', 'landSize'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
        throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate landSize is a positive number
    const landSize = Number(data.landSize);
    if (isNaN(landSize) || landSize <= 0) {
        throw new ValidationError('Land size must be a positive number');
    }

    // Validate phone number format
    if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(data.phone)) {
        throw new ValidationError('Invalid phone number format. Use (XX) XXXXX-XXXX');
    }

    // Validate email format if provided
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new ValidationError('Invalid email format');
    }

    // Ensure cropTypes is an array
    if (data.cropTypes && !Array.isArray(data.cropTypes)) {
        if (typeof data.cropTypes === 'string') {
            data.cropTypes = data.cropTypes.split(',').map(crop => crop.trim()).filter(Boolean);
        } else {
            throw new ValidationError('Crop types must be an array or comma-separated string');
        }
    }
};

// Get all farmers
router.get('/', (req, res) => {
    const farmers = Farmer.getAll();
    res.json(farmers);
});

// Search farmers
router.get('/search', (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.json(Farmer.getAll());
    }
    const results = Farmer.search(query);
    res.json(results);
});

// Get farmer by ID
router.get('/:id', (req, res, next) => {
    try {
        const farmer = Farmer.findById(req.params.id);
        if (!farmer) {
            throw new NotFoundError('Farmer not found');
        }
        res.json(farmer);
    } catch (error) {
        next(error);
    }
});

// Create new farmer
router.post('/', (req, res, next) => {
    try {
        validateFarmerData(req.body);
        const farmer = Farmer.create({
            ...req.body,
            landSize: Number(req.body.landSize)
        });
        res.status(201).json(farmer);
    } catch (error) {
        next(error);
    }
});

// Update farmer
router.put('/:id', (req, res, next) => {
    try {
        validateFarmerData(req.body);
        const farmer = Farmer.update(req.params.id, {
            ...req.body,
            landSize: Number(req.body.landSize)
        });
        if (!farmer) {
            throw new NotFoundError('Farmer not found');
        }
        res.json(farmer);
    } catch (error) {
        next(error);
    }
});

// Delete farmer
router.delete('/:id', (req, res, next) => {
    try {
        const success = Farmer.delete(req.params.id);
        if (!success) {
            throw new NotFoundError('Farmer not found');
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

module.exports = router;