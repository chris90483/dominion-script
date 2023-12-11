function getOptionsCookie() {
  const cookieString = document.cookie;
  const cookieArray = cookieString.split('; ');

  for (const cookie of cookieArray) {
    const [name, value] = cookie.split('=');
    if (name === 'options') {
      try {
        // Parse the JSON string stored in the cookie
        return JSON.parse(decodeURIComponent(value));
      } catch (error) {
        console.error('Error parsing JSON from the options cookie:', error);
      }
    }
  }
  return null;
}

function setOptionsCookie(optionsObject, expirationDays = 365) {
  const optionsString = encodeURIComponent(JSON.stringify(optionsObject));
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + expirationDays);
  document.cookie = `options=${optionsString}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict; Secure`;
}
