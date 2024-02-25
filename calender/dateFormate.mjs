function getCurrentTimeZoneOffset() {
  const currentDate = new Date();
  const timeZoneOffsetMinutes = currentDate.getTimezoneOffset();
  return timeZoneOffsetMinutes;
}

function convertToISOStringWithOffset(dateString, timeString) {
  const timeZoneOffsetMinutes = getCurrentTimeZoneOffset();

  const [year, month, day] = dateString.split('/').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);

  // Create a new Date object with the provided values
  const date = new Date(year, month - 1, day, hours, minutes);

  // Adjust the time zone offset
  date.setMinutes(date.getMinutes() - timeZoneOffsetMinutes);

  // Format the date to ISO string with time zone offset
  const isoString = date.toISOString();

  return isoString;
}


function addMinutesToTime(startTime, minutesToAdd) {
  const [hours, minutes] = startTime.split(':').map(Number);

  // Create a new Date object with the provided time
  const date = new Date();
  date.setHours(hours);

  // Add minutes to the time
  date.setMinutes(date.getMinutes() + minutesToAdd);

  // Format the new time
  const newHours = date.getHours().toString().padStart(2, '0');
  const newMinutes = date.getMinutes().toString().padStart(2, '0');

  return `${newHours}:${newMinutes}`;
}

function getCurrentTimeZone() {
  // Get the time zone from the Intl.DateTimeFormat object
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return timeZone;
}

export { getCurrentTimeZone, convertToISOStringWithOffset, addMinutesToTime }
