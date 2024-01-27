document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("top-100-button")
    .addEventListener("click", () => fetchCategoryMovies("top_rated"));
  document
    .getElementById("upcoming-movies-button")
    .addEventListener("click", () => fetchCategoryMovies("upcoming"));
  document
    .getElementById("now-playing-button")
    .addEventListener("click", () => fetchCategoryMovies("now_playing"));
  const searchButton = document.getElementById("search-button");
  searchButton.addEventListener("click", fetchMovies);
});

const fetchCategoryMovies = (category) => {
  const apiKey = "c0c5c92325ed2fd5252ec2cc1f91332a";
  let url;

  switch (category) {
    case "top_rated":
      url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=sv-SE&page=1`;
      break;
    case "upcoming":
      url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=sv-SE&page=1`;
      break;
    case "now_playing":
      url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=sv-SE&page=1`;
      break;
  }

  if (url) {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const movies = data.results;
        return Promise.all(
          movies.map((movie) => fetchMovieDetails(apiKey, movie))
        );
      })
      .then((movies) => displayMovies(movies))
      .catch((error) => console.error("Error:", error));
  }
};

const fetchMovies = () => {
  const apiKey = "c0c5c92325ed2fd5252ec2cc1f91332a";
  const movieQuery = document.getElementById("movie-search-input").value;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=sv-SE&query=${encodeURIComponent(
    movieQuery
  )}`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.results.length === 0) {
        displayNoResultsMessage();
        return;
      }
      const movies = data.results;
      return Promise.all(
        movies.map((movie) => fetchMovieDetails(apiKey, movie))
      );
    })
    .then((movies) => movies && displayMovies(movies))
    .catch((error) => {
      console.error("Error fetching data:", error);
      displayErrorMessage(
        "Somethings wrong with the projector.. Grab a coffe and try again in a few :)"
      );
    });
};

const displayNoResultsMessage = () => {
  const container = document.getElementById("movies");
  container.innerHTML = `<p class="no-results-message">In space no one can here you scream ;)</p>`;
};

const displayErrorMessage = (message) => {
  const container = document.getElementById("movies");
  container.innerHTML = `<p class="error-message">${message}</p>`;
};

const fetchMovieDetails = (apiKey, movie) => {
  const url = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&append_to_response=credits`;
  return fetch(url)
    .then((response) => response.json())
    .then((details) => {
      const director =
        details.credits.crew.find((person) => person.job === "Director")
          ?.name || "Rob the Teacher"; // Did you notice this one? ;)
      const releaseYear = details.release_date
        ? details.release_date.split("-")[0]
        : "No clue bro..";
      const imageUrl = details.poster_path
        ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
        : "./images/404.png";
      return {
        ...movie,
        director,
        releaseYear,
        imageUrl,
      };
    });
};

const displayMovies = (movies) => {
  const container = document.getElementById("movies");
  container.innerHTML = "";

  movies.forEach((movie) => {
    const movieElement = document.createElement("div");
    movieElement.classList.add("movie");
    movieElement.innerHTML = `
            <h3>${movie.title} (${movie.releaseYear})</h3>
            <p><strong>Magic maker:</strong> ${movie.director}</p>
            <img src="${
              movie.imageUrl
            }" onerror="this.onerror=null;this.src='./images/404.png';" alt="${
      movie.title
    }" style="width:200px;">
            <p>${
              movie.overview ||
              "Yeah.. so this is a movie about.. something.. something.. REDRUM.."
            }</p>
            <a href="https://www.themoviedb.org/movie/${
              movie.id
            }" target="_blank" class="tmdb-link">Take the plunge on TMDb</a>
        `;
    container.appendChild(movieElement);
  });
};
