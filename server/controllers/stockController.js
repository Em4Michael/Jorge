// controllers/stockController.js
const Stock = require('../models/Stock');

exports.getStockAvailability = async (req, res) => {
    try {
        const stock = await Stock.find();
        res.status(200).json(stock);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllStock = async (req, res) => {
    try {
        const stock = await Stock.find();
        res.status(200).json(stock);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getStockById = async (req, res) => {
    try {
        const stock = await Stock.findById(req.params.id);
        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }
        res.status(200).json(stock);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createStock = async (req, res) => {
    try {
        const { item, quantity, pricePerCarton, weeklyCapacity } = req.body;

        // Create new stock item
        const newStock = new Stock({
            item,
            quantity,
            pricePerCarton,
            weeklyCapacity
        });

        await newStock.save();

        res.status(201).json(newStock);
    } catch (error) {
        console.error('Error creating stock:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update an existing stock item
exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, pricePerCarton, weeklyCapacity } = req.body;

        if (!quantity || !pricePerCarton || !weeklyCapacity) {
            return res.status(400).json({ error: 'Quantity, price per carton, and weekly capacity are required' });
        }

        // Find the latest stock document
        const latestStock = await Stock.findOne({ _id: id }).sort({ createdAt: -1 }).exec();
        if (!latestStock) {
            return res.status(404).json({ error: 'Stock item not found' });
        }

        // Create a new stock document with updated values
        const updatedStock = new Stock({
            item: latestStock.item,
            quantity,
            pricePerCarton,
            weeklyCapacity,
            createdAt: new Date(),
        });

        await updatedStock.save();

        res.status(200).json({ message: 'Stock updated successfully', data: updatedStock });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteStock = async (req, res) => {
    try {
        const stock = await Stock.findByIdAndDelete(req.params.id);
        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }
        res.status(200).json({ message: 'Stock item deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
