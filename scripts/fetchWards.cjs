const fs = require('fs');

const SOURCES = [
  "https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/mumbai/mumbai_wards.geojson",
  "https://raw.githubusercontent.com/geohacker/mumbai/master/mumbai-wards.geojson",
  "https://raw.githubusercontent.com/guptarohit/mumbai-wards-geojson/master/mumbai_wards.geojson",
  "https://raw.githubusercontent.com/codeforboston/india-data-shapefiles/master/mumbai-wards/mumbai_wards.geojson"
];

async function fetchWards() {
  for (const url of SOURCES) {
    try {
      console.log('Trying:', url);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        console.log('SUCCESS! Features:', data.features?.length);
        fs.writeFileSync(
          './src/data/mumbaiWardsReal.json', 
          JSON.stringify(data, null, 2)
        );
        console.log('Saved to src/data/mumbaiWardsReal.json');
        return;
      }
    } catch(e) { 
      console.log('Failed:', url, e.message);
      continue; 
    }
  }
  console.log('ALL SOURCES FAILED — use fallback');
}
fetchWards();
