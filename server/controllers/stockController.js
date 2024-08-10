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
      const { item, quantity, pricePerCarton, stemAmount, totalPlantAmount, weeklyCapacity } = req.body;
  
      const newStock = new Stock({
        item,
        quantity,
        pricePerCarton,
        stemAmount,
        totalPlantAmount,
        weeklyCapacity,
      });
  
      await newStock.save();
  
      res.status(201).json({ message: 'Stock created successfully', stock: newStock });
    } catch (error) {
      console.error('Error creating stock:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  exports.updateStock = async (req, res) => {
    try {
      const { id } = req.params;
      const { item, quantity, pricePerCarton, stemAmount, totalPlantAmount, weeklyCapacity } = req.body;
  
      const stock = await Stock.findById(id);
      if (!stock) {
        return res.status(404).json({ error: 'Stock item not found' });
      }
  
      stock.item = item || stock.item;
      stock.quantity = quantity || stock.quantity;
      stock.pricePerCarton = pricePerCarton || stock.pricePerCarton;
      stock.stemAmount = stemAmount || stock.stemAmount;
      stock.totalPlantAmount = totalPlantAmount || stock.totalPlantAmount;
      stock.weeklyCapacity = weeklyCapacity || stock.weeklyCapacity;
  
      await stock.save();
  
      res.status(200).json({ message: 'Stock updated successfully', stock });
    } catch (error) {
      console.error('Error updating stock:', error);
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