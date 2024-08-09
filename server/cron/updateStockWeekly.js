const cron = require('node-cron');
const Stock = require('../models/Stock');

const updateStockWeekly = async () => {
    try {
        const stocks = await Stock.find();

        for (const stock of stocks) {
            const newQuantity = Math.floor(stock.expectedPercent / 100 * stock.totalPlantAmount * stock.stemAmount);
            stock.quantity = newQuantity;
            await stock.save();
        }

        console.log('Stock updated to expected productivity');
    } catch (error) {
        console.error('Error updating stock:', error);
    }
};

cron.schedule('0 0 * * 5', updateStockWeekly);

module.exports = updateStockWeekly;
