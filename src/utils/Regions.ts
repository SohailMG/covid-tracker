export interface RegionData {
  name: string;
  coords: Coords;
}
interface Coords {
  lat: number;
  lng: number;
  radius: string;
}
/* uk regions data with center coordinates for
  fetching tweets by location */
export const REGIONS: RegionData[] = [
  {
    name: "england",
    coords: { lat: 51.51753, lng: -0.11214, radius: "100km" },
  },
  {
    name: "wales",
    coords: { lat: 51.482051, lng: -3.179048, radius: "100km" },
  },
  {
    name: "scotland",
    coords: { lat: 54.57819, lng: -5.93412, radius: "100km" },
  },
  {
    name: "northern+ireland",
    coords: {
      lat: 54.55061810433951,
      lng: -6.005602779583032,
      radius: "100km",
    },
  },
];
