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
        const { 
            item, 
            quantity, 
            pricePerCarton, 
            weeklyCapacity, 
            expectedPercent = 90,  // Default to 90 if not provided
            stemAmount = 2,  // Default to 2 if not provided
            totalPlantAmount = 500  // Default to 500 if not provided
        } = req.body;

        // Calculate expected productivity based on provided values or defaults
        const expectedProductivity = expectedPercent / 100 * stemAmount * totalPlantAmount;

        const newStock = new Stock({
            item,
            quantity,
            pricePerCarton,
            weeklyCapacity,
            expectedPercent,
            stemAmount,
            totalPlantAmount,
            expectedProductivity,  // Include the calculated expected productivity
        });

        await newStock.save();

        res.status(201).json(newStock);
    } catch (error) {
        console.error('Error creating stock:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, pricePerCarton, weeklyCapacity } = req.body;

        if (!quantity || !pricePerCarton || !weeklyCapacity) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const latestStock = await Stock.findOne({ _id: id }).sort({ createdAt: -1 }).exec();
        if (!latestStock) {
            return res.status(404).json({ error: 'Stock item not found' });
        }

        // Calculate expected productivity
        const expectedProductivity = (latestStock.expectedPercent / 100) * latestStock.stemAmount * latestStock.totalPlantAmount;

        const adjustedQuantity = (quantity * expectedProductivity) / 100;

        const updatedStock = new Stock({
            item: latestStock.item,
            quantity: adjustedQuantity,
            pricePerCarton,
            expectedPercent: latestStock.expectedPercent,
            stemAmount: latestStock.stemAmount,
            totalPlantAmount: latestStock.totalPlantAmount,
            expectedProductivity,
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

exports.getProductivityReport = async (req, res) => {
    try {
      const stocks = await Stock.find();
  
      const productivityReport = stocks.map((stock) => {
        const productivityPercent = (stock.quantity / stock.expectedProductivity) * 100;
        return {
          item: stock.item,
          currentQuantity: stock.quantity,
          expectedProductivity: stock.expectedProductivity,
          productivityPercent: productivityPercent.toFixed(2),
        };
      });
  
      res.status(200).json(productivityReport);
    } catch (error) {
      console.error('Error fetching productivity report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };