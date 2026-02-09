(() => {
  const mapElement = document.getElementById("listing-map");
  const statusElement = document.getElementById("listing-map-status");

  if (!mapElement) {
    return;
  }

  const location = mapElement.dataset.location || "";
  const area = mapElement.dataset.area || "";
  const postcode = mapElement.dataset.postcode || "";
  const query = [location, area, postcode]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ");

  const setStatus = (message) => {
    if (statusElement) {
      statusElement.textContent = message;
    }
  };

  if (!query) {
    setStatus("Add a location to view the map.");
    return;
  }

  setStatus("Loading map...");

  fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`)
    .then((response) => response.json())
    .then((results) => {
      if (!results.length) {
        setStatus("We couldn't find this address on the map.");
        return;
      }

      const result = results[0];
      const lat = Number(result.lat);
      const lon = Number(result.lon);

      const map = L.map(mapElement).setView([lat, lon], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker([lat, lon]).addTo(map).bindPopup(result.display_name).openPopup();

      setStatus("Showing the listing location.");
    })
    .catch(() => {
      setStatus("Map is unavailable right now. Please try again later.");
    });
})();