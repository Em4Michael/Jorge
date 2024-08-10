const PlantReport = require('../models/PlantReport');
const Stock = require('../models/Stock');

const logProductivity = async (req, res) => {
  const { plantTag, red = 0, yellow = 0, green = 0, flower = 0, estimatedPlants, estimatedAffectedStem, description } = req.body;

  try {
    const stock = await Stock.findOne().sort({ createdAt: -1 });

    if (!stock) {
      return res.status(404).json({ error: 'Stock information not found' });
    }

    const { stemAmount, totalPlantAmount } = stock;

    let plantReport = await PlantReport.findOne({ plantTag });

    if (!plantReport) {
      plantReport = new PlantReport({ plantTag });
    }

    const totalProduction = 5 * totalPlantAmount * stemAmount;

    const calculateExpected = (stageValue, totalProduction, estimatedPlants, estimatedAffectedStem) => {
      const adjustmentFactor = estimatedPlants * estimatedAffectedStem;
      let adjustment = 0;

      if (stageValue < 5) {
        adjustment = (5 - stageValue) * adjustmentFactor;
        return totalProduction - adjustment;
      } else if (stageValue > 5) {
        adjustment = (stageValue - 5) * adjustmentFactor;
        return totalProduction + adjustment;
      }
      return totalProduction;
    };

    const amountRed = calculateExpected(red, totalProduction, estimatedPlants, estimatedAffectedStem);
    const amountYellow = calculateExpected(yellow, totalProduction, estimatedPlants, estimatedAffectedStem);
    const amountGreen = calculateExpected(green, totalProduction, estimatedPlants, estimatedAffectedStem);
    const amountFlower = calculateExpected(flower, totalProduction, estimatedPlants, estimatedAffectedStem);

    const expected = {
      week1: { 
        amount: amountRed, 
        percent: ((amountRed / totalProduction) * 100).toFixed(2)
      },
      week2: { 
        amount: amountYellow, 
        percent: ((amountYellow / totalProduction) * 100).toFixed(2)
      },
      week3: { 
        amount: amountGreen, 
        percent: ((amountGreen / totalProduction) * 100).toFixed(2)
      },
      week4: { 
        amount: amountFlower, 
        percent: ((amountFlower / totalProduction) * 100).toFixed(2)
      },
    };

    plantReport.productivity = {
      red: red || plantReport.productivity.red,
      yellow: yellow || plantReport.productivity.yellow,
      green: green || plantReport.productivity.green,
      flower: flower || plantReport.productivity.flower,
    };

    plantReport.expected = expected;
    plantReport.description = description;

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
