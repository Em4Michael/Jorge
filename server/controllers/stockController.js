

exports.getStockAvailability = async (req, res) => {
    // Example: Fetch from database
    const stock = await Stock.find(); // Assuming you have a Stock model
  
    res.status(200).json(stock);
  };


exports.getAllStock = async (req, res) => {
    try {
        const stock = await Stock.find(); // Fetch all stock items from the database
        res.status(200).json(stock);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Function to get stock by ID
exports.getStockById = async (req, res) => {
    try {
        const stock = await Stock.findById(req.params.id); // Find stock by ID
        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }
        res.status(200).json(stock);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Function to create a new stock item
exports.createStock = async (req, res) => {
    try {
        const newStock = new Stock(req.body); // Create a new stock item
        await newStock.save(); // Save the new stock item to the database
        res.status(201).json(newStock);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Function to update stock by ID
exports.updateStock = async (req, res) => {
    try {
        const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true }); // Update stock item
        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }
        res.status(200).json(stock);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Function to delete stock by ID
exports.deleteStock = async (req, res) => {
    try {
        const stock = await Stock.findByIdAndDelete(req.params.id); // Delete stock item
        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }
        res.status(200).json({ message: 'Stock item deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};