const API_BASE = "/api";

const fetchJson = async (url, options) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = new Error("Request failed");
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export const fetchDailyChallenge = async () => {
  return fetchJson(`${API_BASE}/games/daily_challenge/`);
};
