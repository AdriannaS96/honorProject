(() => {
  const mapElement = document.getElementById("home-map");
  const statusElement = document.getElementById("home-map-status");
  const listings = Array.isArray(window.listingMapData) ? window.listingMapData : [];

  if (!mapElement) {
    return;
  }

  const setStatus = (message) => {
    if (statusElement) {
      statusElement.textContent = message;
    }
  };

  if (!listings.length) {
    setStatus("No listings available to display on the map.");
    return;
  }

  setStatus("Loading map...");

  const map = L.map(mapElement).setView([55.8642, -4.2518], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const geocodeCache = new Map();
  const bounds = [];

  const buildQuery = (listing) =>
    [listing.location, listing.area, listing.postcode]
      .map((value) => (value || "").trim())
      .filter(Boolean)
      .join(", ");

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const geocode = async (query) => {
    if (!query) {
      return null;
    }

    if (geocodeCache.has(query)) {
      return geocodeCache.get(query);
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
    );

    const results = await response.json();
    const result = results[0]
      ? {
          lat: Number(results[0].lat),
          lon: Number(results[0].lon),
          label: results[0].display_name,
        }
      : null;

    geocodeCache.set(query, result);
    await sleep(1100);

    return result;
  };

  const renderMarkers = async () => {
    let markersAdded = 0;

    for (const listing of listings) {
      const query = buildQuery(listing);
      if (!query) {
        continue;
      }

      try {
        const result = await geocode(query);
        if (!result) {
          continue;
        }

        const popup = `
          <strong>${listing.title}</strong><br />
          ${listing.location || ""} ${listing.postcode || ""}<br />
          £${listing.price}<br />
          <a href="/listing/${listing.id}">View details</a>
        `;

        L.marker([result.lat, result.lon]).addTo(map).bindPopup(popup);
        bounds.push([result.lat, result.lon]);
        markersAdded += 1;
      } catch (error) {
        console.error("Map geocoding failed", error);
      }
    }

    if (!markersAdded) {
      setStatus("We couldn't map the listings yet.");
      return;
    }

    map.fitBounds(bounds, { padding: [40, 40] });
    setStatus(`Showing ${markersAdded} listing${markersAdded === 1 ? "" : "s"} on the map.`);
  };

  renderMarkers();
})();