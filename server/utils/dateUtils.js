const getLastFriday = (date) => {
    const day = date.getDay();
    const diff = (day >= 5) ? day - 5 : day + 2; 
    const lastFriday = new Date(date);
    lastFriday.setDate(date.getDate() - diff);
    lastFriday.setHours(0, 0, 0, 0); 
    return lastFriday;
};

module.exports = { getLastFriday };
