const fs = require('fs');

const GEOJSON_SOURCES = [
  "https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/mumbai/mumbai_wards.geojson",
  "https://raw.githubusercontent.com/geohacker/mumbai/master/mumbai-wards.geojson",
  "https://raw.githubusercontent.com/guptarohit/mumbai-wards-geojson/master/mumbai_wards.geojson"
];

async function fetchGeoJSON() {
  let geojsonData = null;
  for (const url of GEOJSON_SOURCES) {
    try {
      console.log('Trying', url);
      const res = await fetch(url);
      if (res.ok) {
        geojsonData = await res.json();
        console.log('Success with', url);
        break;
      }
    } catch(e) {
      console.error('Failed', url, e.message);
    }
  }

  if (!geojsonData) {
    console.error('All URLs failed');
    return;
  }

  fs.writeFileSync('src/data/mumbaiWardsRaw.json', JSON.stringify(geojsonData, null, 2));
  console.log('Saved to src/data/mumbaiWardsRaw.json');
}

fetchGeoJSON();
