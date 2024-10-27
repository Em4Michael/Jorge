// calculationUtils.js

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
  
  module.exports = { calculateExpected };
  