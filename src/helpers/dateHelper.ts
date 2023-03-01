export const formatDate = (dateMilli: number) => {
  const dateMinus24Hours = dateMilli - 86400000;
  const yesterday = new Date(dateMinus24Hours).toISOString().split("T")[0];
  return yesterday;
};

//setInterval(formatDate, 5000);
