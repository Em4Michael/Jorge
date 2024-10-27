const SalesReport = require('../models/SalesReport');
const Order = require('../models/Order');
const Stock = require('../models/Stock');
const Fee = require('../models/Fee');

const generateSalesReport = async () => {
    try {
        // Fetch the latest fee details
        const fee = await Fee.findOne().sort({ createdAt: -1 });

        // Fetch all orders
        const orders = await Order.find().populate('items.item');

        // Calculate total sales, pending orders, and other analytics
        let totalSales = 0;
        let pendingOrders = 0;
        orders.forEach(order => {
            if (order.status === 'paid') {
                totalSales += order.total;
            }
            if (order.deliveryStatus === 'pending') {
                pendingOrders++;
            }
        });

        // Fetch all stock items for productivity analysis
        const stocks = await Stock.find();
        const stockAnalysis = stocks.map(stock => ({
            item: stock.item,
            totalQuantity: stock.quantity,
            pricePerCarton: stock.pricePerCarton,
            productivity: (stock.quantity / stock.expectedProductivity) * 100
        }));

        // Create a new sales report
        const newSalesReport = new SalesReport({
            totalSales,
            pendingOrders,
            stockAnalysis,
            deliveryFee: fee ? fee.deliveryFee : 0,
            taxRate: fee ? fee.taxRate : 0
        });

        // Save the report only if it's different from the most recent report
        const lastReport = await SalesReport.findOne().sort({ createdAt: -1 });
        if (!lastReport || JSON.stringify(lastReport) !== JSON.stringify(newSalesReport)) {
            await newSalesReport.save();
        }
    } catch (error) {
        console.error('Error generating sales report:', error);
    }
};

module.exports = generateSalesReport;
