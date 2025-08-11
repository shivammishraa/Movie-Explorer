import { fetchPopular, searchMovies } from "./api.js";
import { debounce } from "./debounce.js";
import { loadFavorites, saveFavorites, toggleFavorite } from "./favorites.js";

const el = {
  q: document.getElementById("q"),
  status: document.getElementById("status"),
  list: document.getElementById("results"),
  favList: document.getElementById("favorites"),
  favStatus: document.getElementById("fav-status")
};

let state = {
  phase: "idle", // idle, loading, success, empty, error
  items: [],
  message: "",
  favorites: [],
  mode: "popular",
  lastQuery: ""
};

function setState(next) {
  state = { ...state, ...next };
  render();
}

let dotsTimerId = null;
let dots = 0;

function startLoadingDots() {
  stopLoadingDots();
  dots = 0;
  dotsTimerId = setInterval(() => {
    dots = (dots + 1) % 4;
    el.status.textContent = "Loading" + ".".repeat(dots);
  }, 500);
}

function stopLoadingDots() {
  if (dotsTimerId) {
    clearInterval(dotsTimerId);
    dotsTimerId = null;
    dots = 0;
  }
}

function render() {
  if (state.phase === "loading") {
    startLoadingDots();
  } else {
    stopLoadingDots();
    el.status.textContent = state.message;
  }

  if (state.phase === "success") {
    el.list.replaceChildren(...state.items.map(makeCard));
  } else {
    el.list.replaceChildren();
  }

  // Render favorites
  if (state.favorites.length === 0) {
    el.favStatus.textContent = "No favorites yet.";
    el.favList.replaceChildren();
  } else {
    el.favStatus.textContent = `${state.favorites.length} favorites`;
    el.favList.replaceChildren(...state.favorites.map(makeCard));
  }
}

function makeCard(movie) {
  const div = document.createElement("div");
  div.className = "card";

  const poster = movie.Poster !== "N/A"
    ? movie.Poster
    : "https://placehold.co/342x513?text=No+Image";

  const isFav = state.favorites.some((m) => m.imdbID === movie.imdbID);

  div.innerHTML = `
    <img src="${poster}" alt="${movie.Title}" />
    <h3>${movie.Title}</h3>
    <p>${movie.Year}</p>
    <button>${isFav ? "Remove Favorite" : "Add Favorite"}</button>
  `;

  div.querySelector("button").addEventListener("click", () => {
    const updated = toggleFavorite(movie, state.favorites);
    saveFavorites(updated);
    setState({ favorites: updated });
  });

  return div;
}



const onType = debounce(async (e) => {
  const query = e.target.value.trim();

  if (!query) {
    setState({ mode: "popular", lastQuery: "" });
    loadPopular();
    return;
  }

  if (query.length < 2) {
    setState({
      phase: "idle",
      items: [],
      message: "Type at least 2 characters",
      mode: "search",
      lastQuery: query
    });
    return;
  }

  setState({ phase: "loading", items: [], message: "", mode: "search", lastQuery: query });

  try {
    const items = await searchMovies(query, 20);
    if (items.length === 0) {
      setState({ phase: "empty", items: [], message: "No items found." });
    } else {
      setState({
        phase: "success",
        items,
        message: `${items.length} results for "${query}"`
      });
    }
  } catch (err) {
    console.error("Search failed", err.message);
    setState({
      phase: "error",
      items: [],
      message: "Something went wrong."
    });
  }
}, 400);

el.q.addEventListener("input", onType);

async function loadPopular() {
  setState({ phase: "loading", items: [], message: "", mode: "popular", lastQuery: "" });

  try {
    const items = await fetchPopular(20);
    if (items.length === 0) {
      setState({ phase: "empty", items: [], message: "No items found." });
    } else {
      setState({
        phase: "success",
        items,
        message: `${items.length} popular movies`
      });
    }
  } catch (err) {
    console.error("Popular fetch failed", err.message);
    setState({
      phase: "error",
      items: [],
      message: "Something went wrong."
    });
  }
}

function init() {
  const favorites = loadFavorites();
  setState({
    phase: "idle",
    items: [],
    message: "Type something to start search",
    favorites
  });
  loadPopular();
}

init();
