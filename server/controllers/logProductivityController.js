const logProductivity = async (req, res) => {
    const { plantTag, red, yellow, green, flower } = req.body;
  
    try {
      let plantReport = await PlantReport.findOne({ plantTag });
  
      if (!plantReport) {
        plantReport = new PlantReport({ plantTag });
      }
  
      const expectedProductivity = {
        red: 5,
        yellow: 5,
        green: 5,
        flower: 5,
      };
  
      const totalExpected = expectedProductivity.red + expectedProductivity.yellow + expectedProductivity.green + expectedProductivity.flower;
      const totalActual = (red || plantReport.productivity.red) + (yellow || plantReport.productivity.yellow) + (green || plantReport.productivity.green) + (flower || plantReport.productivity.flower);
  
      const productivityPercent = (totalActual / totalExpected) * 100;
  
      plantReport.productivity = {
        red: red || plantReport.productivity.red,
        yellow: yellow || plantReport.productivity.yellow,
        green: green || plantReport.productivity.green,
        flower: flower || plantReport.productivity.flower,
        productivityPercent: productivityPercent.toFixed(2),
      };
  
      await plantReport.save();
  
      res.status(200).json({ message: 'Productivity logged successfully', plantReport });
    } catch (err) {
      console.error('Log productivity error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  