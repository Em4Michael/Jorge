// const SalesReport = require('../models/SalesReport');
// const { generateSalesReportData } = require('../controllers/salesReportController');

// const generateAndSaveSalesReportIfChanged = async () => {
//   try {
//     // Generate new sales report data dynamically
//     const newReportData = await generateSalesReportData();

//     // Fetch the last saved sales report from the database
//     const lastReport = await SalesReport.findOne().sort({ createdAt: -1 });

//     // Check if there's any change between the new report and the last saved report
//     const hasChanges = !lastReport || JSON.stringify(newReportData) !== JSON.stringify(lastReport.toObject());

//     if (hasChanges) {
//       // Create a new sales report document and save it
//       const newSalesReport = new SalesReport(newReportData);
//       await newSalesReport.save();

//       console.log('Sales report generated and saved successfully');
//     } else {
//       console.log('No changes detected. Sales report not updated.');
//     }
//   } catch (err) {
//     console.error('Error generating or saving sales report:', err);
//   }
// };

// module.exports = { generateAndSaveSalesReportIfChanged };
