export type PatientWithRisk = {
  id: string;
  name: string;
  age: number;
  conditions: string[];
  risk_score: number;
  latest_summary: string | null;
};
