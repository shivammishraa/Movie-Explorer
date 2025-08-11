const API_KEY = "3ebb2977";
const BASE_URL = "https://www.omdbapi.com/";

export async function fetchPopular(limit = 10) {
  const url = `${BASE_URL}?s=batman&type=movie&apikey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.Search?.slice(0, limit) || [];
}

export async function searchMovies(query, limit = 10) {
  const url = `${BASE_URL}?s=${encodeURIComponent(query)}&type=movie&apikey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.Search?.slice(0, limit) || [];
}
