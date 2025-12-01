export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  SCANNER = 'SCANNER',
  HISTORY = 'HISTORY',
  PROFILE = 'PROFILE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  region: string;
  points: number;
}

export interface GeoLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export interface BikeReport {
  id: string;
  userId: string;
  bikeNumber: string;
  region: string;
  location: GeoLocationData;
  timestamp: string;
  status: 'pending' | 'submitted';
}

export interface OCRResult {
  number: string | null;
  confidence: number;
  isBikeNumber: boolean;
}