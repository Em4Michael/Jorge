const PlantReport = require('../models/PlantReport');

const logProductivity = async (req, res) => {
  const { plantTag, red, yellow, green, flower } = req.body;

  try {
    let plantReport = await PlantReport.findOne({ plantTag });

    if (!plantReport) {
      plantReport = new PlantReport({ plantTag });
    }

    plantReport.productivity = {
      red: red || plantReport.productivity.red,
      yellow: yellow || plantReport.productivity.yellow,
      green: green || plantReport.productivity.green,
      flower: flower || plantReport.productivity.flower,
    };

    await plantReport.save();

    res.status(200).json({ message: 'Productivity logged successfully', plantReport });
  } catch (err) {
    console.error('Log productivity error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const reportHealthStatus = async (req, res) => {
  const { plantTag, pest, disease, defects } = req.body;

  try {
    let plantReport = await PlantReport.findOne({ plantTag });

    if (!plantReport) {
      plantReport = new PlantReport({ plantTag });
    }

    plantReport.healthStatus = {
      pest: pest || plantReport.healthStatus.pest,
      disease: disease || plantReport.healthStatus.disease,
      defects: defects || plantReport.healthStatus.defects,
    };

    await plantReport.save();

    res.status(200).json({ message: 'Health status reported successfully', plantReport });
  } catch (err) {
    console.error('Report health status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getPlantReports = async (req, res) => {
  try {
    const reports = await PlantReport.find();
    res.status(200).json(reports);
  } catch (err) {
    console.error('Get plant reports error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { logProductivity, reportHealthStatus, getPlantReports };
