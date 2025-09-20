// Using fetch instead of axiosClient for external API calls

// Types for location data
export interface Province {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
  districts: District[];
}

export interface District {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
  wards: Ward[];
}

export interface Ward {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  district_code: number;
}

const LocationService = {
  // Get all provinces
  async getProvinces(): Promise<Province[]> {
    try {
      const response = await fetch("https://provinces.open-api.vn/api/v1/p/");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Provinces loaded:", data.length);
      return data;
    } catch (error) {
      console.error("Error loading provinces:", error);
      return [];
    }
  },

  // Get districts by province code
  async getDistrictsByProvince(provinceCode: number): Promise<District[]> {
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/v1/p/${provinceCode}?depth=2`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(
        "Districts loaded for province",
        provinceCode,
        ":",
        data.districts?.length || 0
      );
      return data.districts || [];
    } catch (error) {
      console.error("Error loading districts:", error);
      return [];
    }
  },

  // Get wards by district code
  async getWardsByDistrict(districtCode: number): Promise<Ward[]> {
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/v1/d/${districtCode}?depth=2`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(
        "Wards loaded for district",
        districtCode,
        ":",
        data.wards?.length || 0
      );
      return data.wards || [];
    } catch (error) {
      console.error("Error loading wards:", error);
      return [];
    }
  },

  // Helper function to extract coordinates from Google Maps URL
  extractCoordinatesFromUrl(url: string): { lat: number; lng: number } | null {
    try {
      // Pattern 1: https://www.google.com/maps/place/.../@lat,lng,zoom
      const pattern1 = /@(-?\d+\.?\d*),(-?\d+\.?\d*),/;
      const match1 = url.match(pattern1);
      if (match1) {
        return {
          lat: parseFloat(match1[1]),
          lng: parseFloat(match1[2]),
        };
      }

      // Pattern 2: https://maps.google.com/maps?q=lat,lng
      const pattern2 = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      const match2 = url.match(pattern2);
      if (match2) {
        return {
          lat: parseFloat(match2[1]),
          lng: parseFloat(match2[2]),
        };
      }

      // Pattern 3: https://goo.gl/maps/... or https://maps.app.goo.gl/...
      // These are shortened URLs, would need to follow redirects
      console.warn(
        "Shortened URL detected, coordinates extraction may not work"
      );
      return null;
    } catch (error) {
      console.error("Error extracting coordinates from URL:", error);
      return null;
    }
  },
};

export default LocationService;
