const KEY = "favorites";

export function loadFavorites() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Ignore write errors
  }
}

export function toggleFavorite(movie, currentList) {
  const exists = currentList.some((m) => m.imdbID === movie.imdbID);
  if (exists) {
    return currentList.filter((m) => m.imdbID !== movie.imdbID);
  } else {
    return [...currentList, movie];
  }
}
