const SalesReport = require('../models/SalesReport');
const Order = require('../models/Order');
const User = require('../models/User');
const Fee = require('../models/Fee');
const PlantReport = require('../models/PlantReport');
const Stock = require('../models/Stock');

const generateSalesReportData = async () => {
  // Total sales from paid orders
  const totalSalesResult = await Order.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const totalSales = totalSalesResult.length ? totalSalesResult[0].total : 0;

  // Count total pending orders and total orders
  const totalPendingOrders = await Order.countDocuments({ deliveryStatus: 'pending' });
  const totalOrders = await Order.countDocuments();

  // Sales by region (using address as region)
  const salesByLocationData = await Order.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: '$address', totalSales: { $sum: '$total' }, count: { $sum: 1 } } },
  ]);
  const usersByLocation = salesByLocationData.map(u => ({
    address: u._id,
    totalSales: u.totalSales,
    count: u.count,
  }));

  // Sales by salesperson (assuming user in Order is the salesperson)
  const salesByNameData = await Order.aggregate([
    { $match: { status: 'paid' } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userData',
      },
    },
    { $unwind: '$userData' },
    { $group: { _id: '$userData._id', name: { $first: '$userData.name' }, totalSales: { $sum: '$total' }, count: { $sum: 1 } } },
  ]);
  const usersByName = salesByNameData.map(u => ({
    name: u.name,
    totalSales: u.totalSales,
    count: u.count,
  }));

  // Payment by method
  const totalPaymentByMethod = await Order.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: '$paymentMethod', total: { $sum: '$total' } } },
  ]);
  const paymentByMethod = { card: 0, transfer: 0 };
  totalPaymentByMethod.forEach(method => {
    if (method && method._id) paymentByMethod[method._id] = method.total;
  });

  // Fee data
  const fee = await Fee.findOne().sort({ createdAt: -1 });
  if (!fee) throw new Error('Fee data not found');

  // Plant report for predicted sales
  const lastPlantReport = await PlantReport.findOne().sort({ createdAt: -1 });
  const week1Amount = lastPlantReport ? lastPlantReport.expected.week1.amount : 0;

  // Stock data
  const stock = await Stock.findOne().sort({ createdAt: -1 });
  if (!stock) throw new Error('Stock data not found');

  const totalPlantAmount = stock.totalPlantAmount;
  const stemAmount = stock.stemAmount;
  const fruitPerCarton = 100;
  const price = stock.pricePerCarton;

  const totalProduction = ((5 * totalPlantAmount * stemAmount) / fruitPerCarton) * price;
  const predictTotal = (week1Amount / fruitPerCarton) * price;
  const taxAmount = predictTotal * fee.taxRate;
  const total = predictTotal + fee.deliveryFee + taxAmount;

  const actualSales = totalSales;
  const predictedSales = predictTotal + taxAmount + fee.deliveryFee;
  const idealSales = totalProduction + taxAmount + fee.deliveryFee;

  return {
    totalSales: actualSales,
    totalPendingOrders,
    totalOrders,
    usersByName,
    usersByLocation,
    totalPaymentByMethod: paymentByMethod,
    actualSales,
    predictedSales,
    idealSales,
  };
};

const generateSalesReport = async (req, res) => {
  try {
    const newReportData = await generateSalesReportData();
    const lastReport = await SalesReport.findOne().sort({ createdAt: -1 });
    const hasChanges = !lastReport || JSON.stringify(newReportData) !== JSON.stringify(lastReport.toObject());

    if (hasChanges) {
      const newSalesReport = new SalesReport(newReportData);
      await newSalesReport.save();
      return res.status(201).json({ message: 'Sales report generated successfully', salesReport: newSalesReport });
    } else {
      return res.status(200).json({ message: 'No changes detected. Sales report not updated.' });
    }
  } catch (err) {
    console.error('Error generating sales report:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getSalesReports = async (req, res) => {
  try {
    const recentReportData = await generateSalesReportData();
    const savedReports = await SalesReport.find().sort({ createdAt: -1 });
    res.status(200).json({ recentReport: recentReportData, savedReports });
  } catch (err) {
    console.error('Error fetching sales reports:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { generateSalesReport, getSalesReports, generateSalesReportData };