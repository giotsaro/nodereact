const getCurrentDateTime = () => {
  const now = new Date();

  const options = {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat('en-CA', options);
  const parts = formatter.formatToParts(now);

  const getPart = (type) => parts.find((p) => p.type === type).value;

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = getPart('hour');
  const minute = getPart('minute');

  const newdate = `${year}-${month}-${day}T${hour}:${minute}`;
  console.log("Current Date and Time (New York):", newdate);
  return newdate;
};

export default getCurrentDateTime;
