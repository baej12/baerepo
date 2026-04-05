export interface CustomPlace {
  id: string;
  name: string;
  coordinates: [number, number];
  category?: 'visited' | 'interesting' | 'custom';
  note?: string;
}

const mapPlacesData: CustomPlace[] = [];

export default mapPlacesData;
