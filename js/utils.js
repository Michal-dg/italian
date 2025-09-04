// js/utils.js
export const getToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};