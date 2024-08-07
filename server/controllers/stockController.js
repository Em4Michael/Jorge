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
        const { item, quantity } = req.body;

        // Allow for new entries of existing stock items
        const newStock = new Stock({ item, quantity });
        await newStock.save();
        res.status(201).json(newStock);
    } catch (error) {
        console.error('Error creating stock:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params; // Use ID from params
        const { quantity } = req.body; // Use item quantity from the request body

        if (!id || quantity == null) {
            return res.status(400).json({ error: 'ID and quantity are required' });
        }

        // Find the stock by ID and update
        const stock = await Stock.findByIdAndUpdate(
            id,
            { quantity, date: new Date() },
            { new: true }
        );

        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }

        res.status(200).json({ message: 'Stock item updated', data: stock });
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
