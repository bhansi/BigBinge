document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");

  const inputContainers = document.getElementsByClassName("input-container");
  const cbFields = document.getElementsByClassName("checkbox-field");
  const inputFields = document.getElementsByClassName("input-field");
  const nbrFields = document.querySelectorAll("input[type=number]");

  const cbEpisodeQuantity = document.getElementById("cbEpisodeQuantity");
  const cbSeriesRating = document.getElementById("cbSeriesRating");
  const cbEpisodeGenre = document.getElementById("cbEpisodeGenre");

  const btnBinge = document.getElementById("btnBinge");

  let btnBingeDisplayed = false;

  const youtubeApiKey = "AIzaSyDj9GTF0fJlIRpGCewUER9qvUQKh_p6P1A"; // Replace with your YouTube API key

  function isOptionChecked() {
    return cbEpisodeQuantity.checked || cbSeriesRating.checked || cbEpisodeGenre.checked;
  }

  function checkboxHandler(index, checked) {
    if (checked) {
      inputFields[index].style.transform = "translateX(0%)";
      inputContainers[index].style.border = "solid";
      cbFields[index].classList.add("rounded-l-lg");

      if (!btnBingeDisplayed) {
        btnBinge.style.transform = "translateY(0%)";
        btnBingeDisplayed = true;
      }
    } else {
      inputFields[index].style.transform = "translateX(-100%)";
      inputContainers[index].style.border = "solid var(--logo-blue)";
      cbFields[index].classList.remove("rounded-l-lg");

      if (!isOptionChecked()) {
        btnBinge.style.transform = "translateY(-150%)";
        btnBingeDisplayed = false;
      }
    }
  }

  cbEpisodeQuantity.addEventListener("click", function () {
    checkboxHandler(0, cbEpisodeQuantity.checked);
  });

  cbSeriesRating.addEventListener("click", function () {
    checkboxHandler(1, cbSeriesRating.checked);
  });

  cbEpisodeGenre.addEventListener("click", function () {
    checkboxHandler(2, cbEpisodeGenre.checked);
  });

  nbrFields.forEach(function (nbrField) {
    nbrField.addEventListener("focus", function () {
      btnBinge.innerText = "Let's Binge";
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const episodeQuantity = document.getElementById("nbrEpisodeQuantity").value;
    const seriesRating = document.getElementById("nbrSeriesRating").value;
    const episodeGenre = document.getElementById("ddEpisodeGenre").value;
    const resultsDiv = document.getElementById("results");

    // Clear past search results for the current search
    resultsDiv.innerHTML = "";

    let page = 0;
    let numberOfDisplayedSeries = 0;
    let doneDisplaying = false;

    let query = "";
    if (cbEpisodeGenre.checked) {
      query += `&with_genres=${episodeGenre}`;
    }
    if (cbSeriesRating.checked) {
      if(!seriesRating) {
        btnBinge.innerText = "Please fill out the selected field(s).";
        return;
      } else {
        query += `&vote_average.gte=${seriesRating}`;
      }
    }

    try {
      while (!doneDisplaying) {
        page++;
        const apiKey = "3e1cf70d880acb18f154700af5ac63f8";
        const url = `https://api.themoviedb.org/3/discover/tv?include_adult=true&include_null_first_air_dates=true&language=en-US&sort_by=popularity.desc${query}&page=${page}&api_key=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        let shows = data.results;

        shows = await Promise.all(
          shows.map(async (show) => {
            const seriesUrl = `https://api.themoviedb.org/3/tv/${show.id}?language=en-US&api_key=${apiKey}`;
            const seriesResponse = await fetch(seriesUrl);
            const seriesData = await seriesResponse.json();
            show.total_episodes = seriesData.number_of_episodes;
            show.rating = seriesData.vote_average;

            // Fetch YouTube trailer info
            const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${show.name}+trailer&key=${youtubeApiKey}`;
            const youtubeResponse = await fetch(youtubeUrl);
            const youtubeData = await youtubeResponse.json();
            show.youtubeAvailable = youtubeData.items.length > 0;
            show.youtubeVideoId = youtubeData.items[0]?.id?.videoId;

            return show;
          })
        );

        if (shows.length < 1) {
          break; // Stop calling API if there are no more shows with trailers
        }

        if (cbEpisodeQuantity.checked) {
          if(!episodeQuantity) {
            btnBinge.innerText = "Please fill out the selected field(s).";
            break;
          } else {
            shows = shows.filter((show) => show.total_episodes >= episodeQuantity);
          }
        }

        shows.forEach((show) => {
          if (!doneDisplaying) {
            const card = document.createElement("div");
            card.className =
              "bg-white rounded overflow-hidden shadow-lg p-4 hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer";
            card.innerHTML = `
              <img class="w-full" src="https://image.tmdb.org/t/p/w500${show.poster_path}" alt="${show.name}">
              <div class="px-6 py-4">
                <div class="font-bold text-xl mb-2">${show.name}</div>
                <span class="text-green-500">YouTube Trailer Available</span>
                <p class="text-gray-700 text-base">${show.overview}</p>
              </div>
            `;
            card.addEventListener("click", function () {
              localStorage.setItem(show.id, JSON.stringify(show));
              // Open YouTube trailer in a new tab
              window.open(`https://www.youtube.com/watch?v=${show.youtubeVideoId}`);
            });
            resultsDiv.appendChild(card);

            numberOfDisplayedSeries++;
            if (numberOfDisplayedSeries === 18) {
              doneDisplaying = true;
            }
          }
        });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  });
});





