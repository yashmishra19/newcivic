const fs = require('fs');

const WARD_STATS = {
  "A":   { wardId: "A",   wardName: "Fort / Colaba",                zone: "South",   activeIssues: 8,  resolved: 45, responseRate: 92, avgResolution: 2.1, reporters: 234 },
  "B":   { wardId: "B",   wardName: "Dongri / Sandhurst Road",      zone: "South",   activeIssues: 14, resolved: 38, responseRate: 78, avgResolution: 3.5, reporters: 189 },
  "C":   { wardId: "C",   wardName: "Marine Lines / Bhuleshwar",    zone: "South",   activeIssues: 6,  resolved: 52, responseRate: 94, avgResolution: 1.8, reporters: 312 },
  "D":   { wardId: "D",   wardName: "Malabar Hill / Grant Road",    zone: "South",   activeIssues: 4,  resolved: 67, responseRate: 96, avgResolution: 1.5, reporters: 278 },
  "E":   { wardId: "E",   wardName: "Byculla / Reay Road",          zone: "South",   activeIssues: 19, resolved: 28, responseRate: 65, avgResolution: 4.2, reporters: 145 },
  "F/N": { wardId: "F/N", wardName: "Matunga / Sion / Wadala",      zone: "Central", activeIssues: 22, resolved: 31, responseRate: 71, avgResolution: 3.8, reporters: 167 },
  "F/S": { wardId: "F/S", wardName: "Parel / Sewri",                zone: "Central", activeIssues: 11, resolved: 42, responseRate: 82, avgResolution: 2.9, reporters: 198 },
  "G/N": { wardId: "G/N", wardName: "Dadar / Plaza",                zone: "Central", activeIssues: 9,  resolved: 55, responseRate: 88, avgResolution: 2.3, reporters: 245 },
  "G/S": { wardId: "G/S", wardName: "Worli / Prabhadevi",           zone: "Central", activeIssues: 7,  resolved: 61, responseRate: 91, avgResolution: 2.0, reporters: 267 },
  "H/E": { wardId: "H/E", wardName: "Bandra East / Khar East",      zone: "Western", activeIssues: 16, resolved: 39, responseRate: 75, avgResolution: 3.3, reporters: 178 },
  "H/W": { wardId: "H/W", wardName: "Bandra West",                  zone: "Western", activeIssues: 5,  resolved: 58, responseRate: 93, avgResolution: 1.9, reporters: 289 },
  "K/E": { wardId: "K/E", wardName: "Andheri East / Jogeshwari East", zone: "Western", activeIssues: 28, resolved: 22, responseRate: 58, avgResolution: 5.1, reporters: 134 },
  "K/W": { wardId: "K/W", wardName: "Andheri West / Jogeshwari West", zone: "Western", activeIssues: 15, resolved: 44, responseRate: 79, avgResolution: 3.1, reporters: 201 },
  "P/N": { wardId: "P/N", wardName: "Malad",                        zone: "Western", activeIssues: 21, resolved: 33, responseRate: 68, avgResolution: 4.0, reporters: 156 },
  "P/S": { wardId: "P/S", wardName: "Goregaon",                     zone: "Western", activeIssues: 18, resolved: 36, responseRate: 72, avgResolution: 3.6, reporters: 167 },
  "R/N": { wardId: "R/N", wardName: "Dahisar",                      zone: "Western", activeIssues: 13, resolved: 41, responseRate: 81, avgResolution: 2.8, reporters: 187 },
  "R/S": { wardId: "R/S", wardName: "Kandivali",                    zone: "Western", activeIssues: 17, resolved: 37, responseRate: 74, avgResolution: 3.4, reporters: 172 },
  "R/C": { wardId: "R/C", wardName: "Borivali",                     zone: "Western", activeIssues: 10, resolved: 48, responseRate: 85, avgResolution: 2.5, reporters: 213 },
  "L":   { wardId: "L",   wardName: "Kurla",                        zone: "Eastern", activeIssues: 25, resolved: 26, responseRate: 62, avgResolution: 4.5, reporters: 128 },
  "M/E": { wardId: "M/E", wardName: "Chembur / Mankhurd",           zone: "Eastern", activeIssues: 20, resolved: 30, responseRate: 67, avgResolution: 3.9, reporters: 143 },
  "M/W": { wardId: "M/W", wardName: "Deonar / Govandi",             zone: "Eastern", activeIssues: 31, resolved: 19, responseRate: 52, avgResolution: 5.8, reporters: 98  },
  "N":   { wardId: "N",   wardName: "Ghatkopar",                    zone: "Eastern", activeIssues: 14, resolved: 43, responseRate: 80, avgResolution: 3.0, reporters: 195 },
  "S":   { wardId: "S",   wardName: "Mulund / Bhandup",             zone: "Eastern", activeIssues: 12, resolved: 46, responseRate: 83, avgResolution: 2.7, reporters: 205 },
  "T":   { wardId: "T",   wardName: "Mulund East",                  zone: "Eastern", activeIssues: 9,  resolved: 51, responseRate: 87, avgResolution: 2.4, reporters: 218 },
};

const raw = JSON.parse(fs.readFileSync('./src/data/mumbaiWardsReal.json', 'utf8'));

const enriched = {
  ...raw,
  features: raw.features.map(feature => {
    const wardId = feature.properties.name;
    const stats = WARD_STATS[wardId];
    return {
      ...feature,
      properties: {
        gid: feature.properties.gid,
        wardId: wardId || 'UNKNOWN',
        ...(stats || { wardName: wardId, zone: 'Unknown', activeIssues: 0, resolved: 0, responseRate: 0, avgResolution: 0, reporters: 0 }),
      }
    };
  })
};

// Save as JSON (no TypeScript overhead for big files)
fs.writeFileSync('./src/data/mumbaiWards.json', JSON.stringify(enriched));
console.log('✅ Written to src/data/mumbaiWards.json');
console.log('Size:', (fs.statSync('./src/data/mumbaiWards.json').size / 1024).toFixed(0) + 'KB');

// Write thin TS wrapper
const tsWrapper = `// Real BMC ward boundaries — auto-generated from datameet/Municipal_Spatial_Data
import wardData from './mumbaiWards.json';

export interface WardProperties {
  gid: number;
  wardId: string;
  wardName: string;
  zone: string;
  activeIssues: number;
  resolved: number;
  responseRate: number;
  avgResolution: number;
  reporters: number;
}

export const MUMBAI_WARDS = wardData as GeoJSON.FeatureCollection<GeoJSON.Geometry, WardProperties>;
`;
fs.writeFileSync('./src/data/mumbaiWards.ts', tsWrapper);
console.log('✅ Written thin TS wrapper to src/data/mumbaiWards.ts');
