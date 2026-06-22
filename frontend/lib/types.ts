export type Run = {
  id: number;
  date: string;
  distance_km: number;
  duration_seconds: number;
  elevation_gain_m: number | null;
  notes: string | null;
  source: "manual" | "gpx";
  avg_heart_rate_bpm: number | null;
  max_heart_rate_bpm: number | null;
  avg_cadence_spm: number | null;
};

export type RunPoint = {
  sequence: number;
  latitude: number;
  longitude: number;
  elevation: number | null;
  time: string | null;
  heart_rate: number | null;
  cadence: number | null;
  course: number | null;
  horizontal_accuracy: number | null;
  vertical_accuracy: number | null;
};

export type FitPoint = {
  sequence: number;
  time: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  heart_rate: number | null;
  cadence: number | null;
  distance_m: number | null;
  speed_mps: number | null;
  power_w: number | null;
  temperature_c: number | null;
};

export type RunDetail = Run & {
  points: RunPoint[];
  fit_points: FitPoint[];
};
