import fetch from "node-fetch";

export interface QueryAddressResult {
  address: string;
  lng: number;
  lat: number;
}

export const queryAddress = async (
  address: string
): Promise<QueryAddressResult | null> => {
  const key = process.env.GEO_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`;
  const response = await fetch(url);
  const json = await response.json();
  if (json.status !== "OK") {
    return null;
  }
  const lng = json.results[0].geometry.location.lng;
  const lat = json.results[0].geometry.location.lat;
  return {
    address: address,
    lng: lng,
    lat: lat,
  };
};
