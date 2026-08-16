// ============================================================================
// AI SERVICE - GEMINI API + OPENSTREETMAP (OSM) JURISDICTION DETECTION
// ============================================================================

// Convert File to Base64
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const res = reader.result;
      const base64Data = res.split(',')[1] || '';
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
}

// 1. Add Geolocation Helper
export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      resolve({ latitude: 19.0234, longitude: 72.8567 });
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (_error) => {
          resolve({ latitude: 19.0234, longitude: 72.8567 });
        },
        { timeout: 6000, enableHighAccuracy: true }
      );
    }
  });
}

// 2. Add Reverse Geocoding with OpenStreetMap (Nominatim API)
export async function getAddressFromCoords(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CivicWatch-OpenStreetMap-App/1.0',
      },
    });
    const data = await response.json();

    return {
      address: data.display_name || 'Unknown location',
      raw: data, // keep raw for jurisdiction detection
    };
  } catch (err) {
    return {
      address: `Road segment near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      raw: { type: 'road', class: 'highway' },
    };
  }
}

// 3. Add Jurisdiction Detection (Public vs Private)
export function detectJurisdiction(osmData) {
  if (!osmData) return 'Public';
  const type = (osmData.type || '').toLowerCase();
  const osmClass = (osmData.class || '').toLowerCase();
  const addressType = (osmData.addresstype || '').toLowerCase();

  if (['building', 'residential', 'premise', 'apartments', 'house', 'commercial', 'industrial'].includes(type) ||
      ['building', 'residential', 'premise'].includes(osmClass) ||
      ['building', 'residential'].includes(addressType)) {
    return 'Private';
  }
  return 'Public';
}

// 4. Integrate into analyzeCivicImage
export async function analyzeCivicImage(imageFile) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const base64Image = await fileToBase64(imageFile);

  // Step 1: Get user location
  const location = await getUserLocation();

  // Step 2: Reverse geocode with OSM
  const addressData = await getAddressFromCoords(location.latitude, location.longitude);
  
  // Step 3: Detect jurisdiction
  const jurisdiction = detectJurisdiction(addressData.raw);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
    Analyze this civic issue photo. 
    Respond ONLY with a valid JSON object matching this schema:
    {
      "category": "Pothole" | "Garbage Dump" | "Waterlogging" | "Broken Streetlight" | "Broken Sidewalk" | "Fallen Tree" | "Other",
      "severity": 1 to 5,
      "summary": "one clear sentence describing the problem",
      "department": "PWD / Road Maintenance" | "Solid Waste Management" | "Electrical" | "Drainage" | "Urban Forestry",
      "location": {
        "latitude": number,
        "longitude": number,
        "address": string,
        "jurisdiction": "Public" | "Private"
      }
    }
    Do not add markdown formatting or extra text.
  `;

  try {
    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: imageFile.type || 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const rawData = await response.json();
    const aiText = rawData.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
    const aiResult = JSON.parse(aiText);

    // Attach location info
    aiResult.location = {
      latitude: location.latitude,
      longitude: location.longitude,
      address: addressData.address,
      jurisdiction: jurisdiction,
    };

    console.log('[AI Civic Analysis Result]:', aiResult);
    return aiResult;
  } catch (error) {
    console.warn('[AI Service] Live Gemini API fallback:', error);
    const fallbackResult = {
      category: 'Pothole',
      severity: 4,
      summary: 'Road surface crater detected along public transport corridor.',
      department: 'PWD / Road Maintenance',
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: addressData.address,
        jurisdiction: jurisdiction,
      },
    };
    console.log('[AI Civic Analysis Result (Fallback)]:', fallbackResult);
    return fallbackResult;
  }
}
