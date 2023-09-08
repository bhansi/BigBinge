document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");
  const inputFields = document.getElementsByClassName("input-field");

  for(let i = 0; i < inputFields.length; i++) {
    inputFields[i].style.display = "none";
  }

  const cbEisodeQuantity = document.getElementById("cbEpisodeQuantity");
  const cbSeriesRating = document.getElementById("cbSeriesRating");
  const cbEpisodeGenre = document.getElementById("cbEpisodeGenre");

  cbEisodeQuantity.addEventListener("click", function() {
    if(cbEisodeQuantity.checked) {
      inputFields[0].style.display = "inline-block"
    }
    else {
      inputFields[0].style.display = "none";
    }
  });

  cbSeriesRating.addEventListener("click", function() {
    if(cbSeriesRating.checked) {
      inputFields[1].style.display = "inline-block"
    }
    else {
      inputFields[1].style.display = "none";
    }
  });

  cbEpisodeGenre.addEventListener("click", function() {
    if(cbEpisodeGenre.checked) {
      inputFields[2].style.display = "inline-block"
    }
    else {
      inputFields[2].style.display = "none";
    }
  });
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const episodeQuantity = document.getElementById("nbrEpisodeQuantity").value;
    const seriesRating = document.getElementById("nbrSeriesRating").value;
    const episodeGenre = document.getElementById("ddEpisodeGenre").value;
    const resultsDiv = document.getElementById("results");
    
    // Clear past search results for current search results
    resultsDiv.innerHTML = "";
    
    let page = 0;
    let numberOfDisplayedSeries = 0;
    let doneDisplaying = false;
    
    let query = "";
    if (episodeGenreChecked) {
      query += `&with_genres=${episodeGenre}`;
    }
    if (seriesRatingChecked) {
      query += `&vote_average.gte=${seriesRating}`;
    }

    try {
      while(!doneDisplaying) {
          page++;
          const apiKey = "3e1cf70d880acb18f154700af5ac63f8";
          const url = "https://api.themoviedb.org/3/discover/tv?include_adult=true&include_null_first_air_dates=true&language=en-US&sort_by=popularity.desc" + query + "&page=" + page + "&api_key=" + apiKey;
          
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();

          let shows = data.results;

          shows = await Promise.all(shows.map(async show => {
            const seriesUrl = `https://api.themoviedb.org/3/tv/${show.id}?language=en-US&api_key=${apiKey}`;
            const seriesResponse = await fetch(seriesUrl);
            const seriesData = await seriesResponse.json();
            show.total_episodes = seriesData.number_of_episodes;
            show.rating = seriesData.vote_average;
            return show;
          }));

          if(shows.length < 1) { break; } // Stop calling API if there are no more shows

          if (episodeQuantityChecked) {
            shows = shows.filter(show => show.total_episodes >= episodeQuantity);
          }

          shows.forEach(show => {
            if(!doneDisplaying) {
              const card = document.createElement("div");
              card.className = "bg-white rounded overflow-hidden shadow-lg p-4";
              card.innerHTML = `
                <img class="w-full" src="https://image.tmdb.org/t/p/w500${show.poster_path}" alt="${show.name}">
                <div class="px-6 py-4">
                  <div class="font-bold text-xl mb-2">${show.name}</div>
                  <p class="text-gray-700 text-base">${show.overview}</p>
                </div>
              `;
              resultsDiv.appendChild(card);
            }

            numberOfDisplayedSeries++;
            if(numberOfDisplayedSeries === 18) {
              doneDisplaying = true;
            }
          });
        }
      }
      catch (error) {
        console.error("Fetch Error:", error);
      }
  });
});
  



