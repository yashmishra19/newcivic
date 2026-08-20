const fs = require('fs');

const WARD_INFO = [
  { wardId: "A", wardName: "Fort / Colaba", zone: "South", activeIssues: 8, resolved: 45, responseRate: 92, avgResolution: 2.1, reporters: 234 },
  { wardId: "B", wardName: "Dongri / Sandhurst Road", zone: "South", activeIssues: 14, resolved: 38, responseRate: 78, avgResolution: 3.5, reporters: 189 },
  { wardId: "C", wardName: "Marine Lines / Bhuleshwar", zone: "South", activeIssues: 6, resolved: 52, responseRate: 94, avgResolution: 1.8, reporters: 312 },
  { wardId: "D", wardName: "Malabar Hill / Grant Road", zone: "South", activeIssues: 4, resolved: 67, responseRate: 96, avgResolution: 1.5, reporters: 278 },
  { wardId: "E", wardName: "Byculla / Reay Road", zone: "South", activeIssues: 19, resolved: 28, responseRate: 65, avgResolution: 4.2, reporters: 145 },
  { wardId: "F/N", wardName: "Matunga / Sion / Wadala", zone: "Central", activeIssues: 22, resolved: 31, responseRate: 71, avgResolution: 3.8, reporters: 167 },
  { wardId: "F/S", wardName: "Parel / Sewri", zone: "Central", activeIssues: 11, resolved: 42, responseRate: 82, avgResolution: 2.9, reporters: 198 },
  { wardId: "G/N", wardName: "Dadar / Plaza", zone: "Central", activeIssues: 9, resolved: 55, responseRate: 88, avgResolution: 2.3, reporters: 245 },
  { wardId: "G/S", wardName: "Worli / Prabhadevi", zone: "Central", activeIssues: 7, resolved: 61, responseRate: 91, avgResolution: 2.0, reporters: 267 },
  { wardId: "H/E", wardName: "Bandra East / Khar East", zone: "Western", activeIssues: 16, resolved: 39, responseRate: 75, avgResolution: 3.3, reporters: 178 },
  { wardId: "H/W", wardName: "Bandra West", zone: "Western", activeIssues: 5, resolved: 58, responseRate: 93, avgResolution: 1.9, reporters: 289 },
  { wardId: "K/E", wardName: "Andheri East / Jogeshwari East", zone: "Western", activeIssues: 28, resolved: 22, responseRate: 58, avgResolution: 5.1, reporters: 134 },
  { wardId: "K/W", wardName: "Andheri West / Jogeshwari West", zone: "Western", activeIssues: 15, resolved: 44, responseRate: 79, avgResolution: 3.1, reporters: 201 },
  { wardId: "P/N", wardName: "Malad", zone: "Western", activeIssues: 21, resolved: 33, responseRate: 68, avgResolution: 4.0, reporters: 156 },
  { wardId: "P/S", wardName: "Goregaon", zone: "Western", activeIssues: 18, resolved: 36, responseRate: 72, avgResolution: 3.6, reporters: 167 },
  { wardId: "R/N", wardName: "Dahisar", zone: "Western", activeIssues: 13, resolved: 41, responseRate: 81, avgResolution: 2.8, reporters: 187 },
  { wardId: "R/S", wardName: "Kandivali", zone: "Western", activeIssues: 17, resolved: 37, responseRate: 74, avgResolution: 3.4, reporters: 172 },
  { wardId: "R/C", wardName: "Borivali", zone: "Western", activeIssues: 10, resolved: 48, responseRate: 85, avgResolution: 2.5, reporters: 213 },
  { wardId: "L", wardName: "Kurla", zone: "Eastern", activeIssues: 25, resolved: 26, responseRate: 62, avgResolution: 4.5, reporters: 128 },
  { wardId: "M/E", wardName: "Chembur / Mankhurd", zone: "Eastern", activeIssues: 20, resolved: 30, responseRate: 67, avgResolution: 3.9, reporters: 143 },
  { wardId: "M/W", wardName: "Deonar / Govandi", zone: "Eastern", activeIssues: 31, resolved: 19, responseRate: 52, avgResolution: 5.8, reporters: 98 },
  { wardId: "N", wardName: "Ghatkopar", zone: "Eastern", activeIssues: 14, resolved: 43, responseRate: 80, avgResolution: 3.0, reporters: 195 },
  { wardId: "S", wardName: "Mulund / Bhandup", zone: "Eastern", activeIssues: 12, resolved: 46, responseRate: 83, avgResolution: 2.7, reporters: 205 },
  { wardId: "T", wardName: "Mulund East", zone: "Eastern", activeIssues: 9, resolved: 51, responseRate: 87, avgResolution: 2.4, reporters: 218 }
];

// Simplified contiguous grid map for Mumbai. 
// A continuous shape, where nodes are reused.
const grid = {
  // We define vertices and then map wards to vertices
};
// Or just generate rectangles that perfectly touch.

const features = [];
let y = 18.90; // South
const dy = 0.02; // lat diff
const dx = 0.02; // lng diff

const positions = {
  "A": [0,0], "B": [1,0], "C": [0,1], "D": [0,2], "E": [1,1],
  "F/S": [1,2], "G/S": [0,3], "G/N": [0,4], "F/N": [1,3],
  "H/W": [0,5], "H/E": [1,5], "K/W": [0,6], "K/E": [1,6],
  "P/S": [0,7], "P/N": [0,8], "R/S": [0,9], "R/C": [0,10], "R/N": [0,11],
  "L": [2,5], "M/W": [2,3], "M/E": [3,4], "N": [2,6], "S": [2,8], "T": [2,9]
};

const baseX = 72.82;
const baseY = 18.90;

for (const info of WARD_INFO) {
  const [col, row] = positions[info.wardId] || [0,0];
  const x = baseX + col * dx;
  const y = baseY + row * dy;
  const polygon = [
    [x, y],
    [x + dx, y],
    [x + dx, y + dy],
    [x, y + dy],
    [x, y]
  ];
  
  features.push({
    type: "Feature",
    properties: info,
    geometry: {
      type: "Polygon",
      coordinates: [polygon]
    }
  });
}

const geojson = {
  type: "FeatureCollection",
  features
};

fs.writeFileSync('src/data/mumbaiWards.ts', `export const MUMBAI_WARDS = ${JSON.stringify(geojson, null, 2)};`);
console.log('Saved seamless grid to src/data/mumbaiWards.ts');
