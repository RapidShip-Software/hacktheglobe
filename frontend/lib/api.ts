const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TIMEOUT_MS = 15000;

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, timeout = TIMEOUT_MS } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  // Health
  health: () => request<{ status: string }>("/health"),

  // Readings
  postReading: (data: {
    patient_id: string;
    type: string;
    value: Record<string, unknown>;
  }) => request<Record<string, unknown>>("/api/readings", { method: "POST", body: data, timeout: 30000 }),

  // Patients
  getPatients: () => request<Record<string, unknown>[]>("/api/patients"),
  getPatientProfile: (id: string) => request<Record<string, unknown>>(`/api/patients/${id}/profile`),
  getPatientSummary: (id: string) => request<Record<string, unknown>>(`/api/patients/${id}/summary`),
  getPatientHistory: (id: string) => request<Record<string, unknown>[]>(`/api/patients/${id}/history`),

  // Alerts
  getAlerts: () => request<Record<string, unknown>[]>("/api/alerts"),

  // Notes
  postNote: (patientId: string, data: { author: string; content: string }) =>
    request<Record<string, unknown>>(`/api/patients/${patientId}/notes`, { method: "POST", body: data }),

  // Discharge
  postDischarge: (patientId: string) =>
    request<Record<string, unknown>>(`/api/patients/${patientId}/discharge`, { method: "POST", timeout: 30000 }),

  // Chat (Garden Helper)
  chat: (message: string, patientName = "Margaret") =>
    request<{ reply: string }>("/api/chat", { method: "POST", body: { message, patient_name: patientName }, timeout: 20000 }),
};
