document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("searchForm");
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const episodeLengthChecked = document.getElementById("cbEpisodeLength").checked;
      const episodeQuantityChecked = document.getElementById("cbEpisodeQuantity").checked;
      const episodeGenreChecked = document.getElementById("cbEpisodeGenre").checked;
  
      const episodeLength = document.getElementById("nbrEpisodeLength").value;
      const episodeQuantity = document.getElementById("nbrEpisodeQuantity").value;
      const episodeGenre = document.getElementById("ddEpisodeGenre").value;
  
      let query = "";
      if (episodeGenreChecked) {
        query += `&with_genres=${episodeGenre}`;
      }
  
      const apiKey = "3e1cf70d880acb18f154700af5ac63f8";
      const url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1${query}`;
  
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
  
        let shows = data.results;
  
        if (episodeLengthChecked) {
          shows = shows.filter(show => show.episode_run_time[0] >= episodeLength);
        }
  
        if (episodeQuantityChecked) {
          shows = shows.filter(show => show.number_of_episodes >= episodeQuantity);
        }
  
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = "";
  
        shows.forEach(show => {
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
        });
  
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    });
  });
  
  