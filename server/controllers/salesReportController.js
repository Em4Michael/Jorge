const SalesReport = require('../models/SalesReport');
const Order = require('../models/Order');
const User = require('../models/User');
const Fee = require('../models/Fee');
const PlantReport = require('../models/PlantReport');
const Stock = require('../models/Stock');
const { calculateExpected } = require('../utils/calculationUtils'); // import the function

const generateSalesReportData = async () => {
  // Fetch necessary data
  const totalSalesResult = await Order.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);

  // Handle missing data gracefully
  const totalSales = totalSalesResult.length ? totalSalesResult[0].total : 0;

  // Count total pending orders and total orders
  const totalPendingOrders = await Order.countDocuments({ deliveryStatus: 'pending' });
  const totalOrders = await Order.countDocuments();

  // Group users by actual name and address from placed orders
  const usersByNameData = await Order.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: '$user', name: { $first: '$user.name' }, count: { $sum: 1 } } }
  ]);

  const usersByLocationData = await Order.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: '$address', count: { $sum: 1 } } }
  ]);

  // Map the aggregate results to desired structure
  const usersByName = usersByNameData.map(u => ({ name: u.name, count: u.count }));
  const usersByLocation = usersByLocationData.map(u => ({ address: u._id, count: u.count }));

  // Calculate payment by method
  const totalPaymentByMethod = await Order.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: '$paymentMethod', total: { $sum: '$total' } } }
  ]);

  // Initialize payment method totals to avoid errors
  const paymentByMethod = { card: 0, transfer: 0 };
  totalPaymentByMethod.forEach(method => {
    if (method && method._id) {
      paymentByMethod[method._id] = method.total;
    }
  });

  // Get the most recent fee data
  const fee = await Fee.findOne().sort({ createdAt: -1 });
  if (!fee) {
    throw new Error('Fee data not found');
  }

  // Get the most recent PlantReport for predicted sales
  const lastPlantReport = await PlantReport.findOne().sort({ createdAt: -1 });
  const week1Amount = lastPlantReport ? lastPlantReport.expected.week1.amount : 0;

  // Get the Stock data for totalPlantAmount and stemAmount
  const stock = await Stock.findOne().sort({ createdAt: -1 });
  if (!stock) {
    throw new Error('Stock data not found');
  }

  const totalPlantAmount = stock.totalPlantAmount;
  const stemAmount = stock.stemAmount;

  // Calculation parameters
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


// Controller to generate and save a new sales report
const generateSalesReport = async (req, res) => {
  try {
    // Generate new sales report data dynamically
    const newReportData = await generateSalesReportData();

    // Fetch the last saved sales report from the database
    const lastReport = await SalesReport.findOne().sort({ createdAt: -1 });

    // Check if there's any change between the new report and the last saved report
    const hasChanges = !lastReport || JSON.stringify(newReportData) !== JSON.stringify(lastReport.toObject());

    if (hasChanges) {
      // Create a new sales report document and save it
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

// Controller to get the latest dynamically generated sales report and all saved reports
const getSalesReports = async (req, res) => {
  try {
    // Generate the most recent sales report data dynamically
    const recentReportData = await generateSalesReportData();

    // Fetch saved sales reports
    const savedReports = await SalesReport.find().sort({ createdAt: -1 });

    // Include the dynamically generated recent report as the most current
    res.status(200).json({ recentReport: recentReportData, savedReports });
  } catch (err) {
    console.error('Error fetching sales reports:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { generateSalesReport, getSalesReports, generateSalesReportData };
