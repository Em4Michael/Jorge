// utils/dateUtils.js
const getLastFriday = (date) => {
    const day = date.getDay();
    const diff = (day >= 5) ? day - 5 : day + 2; // Calculate difference to last Friday
    const lastFriday = new Date(date);
    lastFriday.setDate(date.getDate() - diff);
    lastFriday.setHours(0, 0, 0, 0); // Set time to the start of the day
    return lastFriday;
};

module.exports = { getLastFriday };
