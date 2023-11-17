document.addEventListener("DOMContentLoaded", function () {
    fetchTrendingMovies();

    var menuIcon = document.querySelector('.menu-icon');
    var menu = document.querySelector('.menu');
    var listItems = document.querySelectorAll('.menu li');

    listItems.forEach(function (item) {
        item.addEventListener('click', function () {
            listItems.forEach(function (li) {
                li.classList.remove('active');
            });
            item.classList.add('active');
        });
    });

    menuIcon.addEventListener('click', function () {
        menu.classList.toggle('active');
    });

    window.addEventListener("scroll", function () {
        var header = document.querySelector("header");
        header.classList.toggle("sticky", window.scrollY > 0);
    });
    var moviePosters = document.querySelectorAll('.movie-poster');
    moviePosters.forEach(function (poster) {
        poster.addEventListener('click', function () {
            var movieCard = poster.closest('.movie-card');
            var title = movieCard.querySelector('h2').textContent;
            var overviewElement = movieCard.querySelector('.overview');
            var ratingElement = movieCard.querySelector('.rating');
            var posterPath = movieCard.querySelector('.movie-poster').src;
            var genreIds = movieCard.dataset.genreIds.split(',').map(Number);

            var overview = overviewElement ? overviewElement.textContent : 'N/A';
            var rating = ratingElement ? ratingElement.textContent : 'N/A';
            displayPopup(title, overview, rating, posterPath, genreIds);
        });
    });
});

function handleGo() {
    var movieInput = document.getElementById('movie-input');
    var selectedCategory = movieInput.value;

    switch (selectedCategory) {
        case 'trending':
            fetchTrendingMovies();
            break;
        case 'toprated':
            window.location.href = 'toprated.html';
            break;
        case 'popular':
            window.location.href = 'popular.html';
            break;
        case 'upcoming':
            window.location.href = 'upcoming.html';
            break;
        default:
            console.error('Invalid category selected');
            break;
    }
}

function fetchTrendingMovies() {
    var request = new XMLHttpRequest();

    request.open('GET', "https://api.themoviedb.org/3/movie/popular?api_key=34b86ff762e0eebc040fd48a67041cf8");

    request.onload = function () {
        var response = request.response;
        var parsedData = JSON.parse(response);
        if (parsedData.results) {
            var movies = parsedData.results;
            var container = document.createElement('div');
            container.id = 'movie-container';

            movies.forEach(movie => {
                var movieCard = document.createElement('div');
                movieCard.className = 'movie-card';

                var title = movie.title || movie.name;
                var posterPath = movie.poster_path;
                var releaseDate = movie.release_date;
                var overview = movie.overview;
                var rating = movie.vote_average;
                var genreIds = movie.genre_ids;
                var releaseYear = new Date(releaseDate).getFullYear();
                var titleElement = document.createElement('h2');
                titleElement.textContent = title;
                movieCard.appendChild(titleElement);
                if (posterPath) {
                    var posterElement = document.createElement('img');
                    posterElement.className = 'movie-poster';
                    posterElement.setAttribute('src', 'https://image.tmdb.org/t/p/w500' + posterPath);
                    movieCard.appendChild(posterElement);
                }
                var releaseYearElement = document.createElement('p');
                releaseYearElement.textContent = releaseYear;
                movieCard.appendChild(releaseYearElement);
                var tooltipElement = document.createElement('div');
                tooltipElement.className = 'tooltip';
                tooltipElement.textContent = 'View Details';
                movieCard.appendChild(tooltipElement);
                movieCard.addEventListener('click', function () {
                    displayPopup(title, overview, rating, posterPath, genreIds);
                });
                container.appendChild(movieCard);
            });
            document.body.appendChild(container);
        }
    };

    request.send();
}

function centerPopup(popupWindow) {
    var screenWidth = screen.width;
    var screenHeight = screen.height;
  
    var popupWidth = popupWindow.outerWidth;
    var popupHeight = popupWindow.outerHeight;
  
    var left = (screenWidth - popupWidth) / 2;
    var top = (screenHeight - popupHeight) / 2;
  
    popupWindow.moveTo(left, top);
}

function displayPopup(title, overview, rating, posterPath, genreIds) {
    var popupWindow = window.open('', '_blank', 'width=800,height=700,scrollbars=yes');
    centerPopup(popupWindow);
    fetchGenreDetails(genreIds, function (movieGenres) {
        fetchMovieVideos(title, function (videos) {
            var popupContent = `
                <html>
                    <head>
                        <style>
                            body {
                                font-family: 'Bebas Neue', sans-serif;
                                background-color: #282828;
                                padding: 20px;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                margin: 0;
                            }

                            h2.popup-title {
                                color: rgb(119, 240, 230);
                                padding-bottom: 10px;
                                letter-spacing: 3px;
                                text-align: center;
                                font-size: 40px;
                            }

                            img.popup-poster {
                                width: 200px;
                                height: 250px;
                                margin-bottom: 10px;
                            }

                            p.popup-text {
                                color: #fff;
                                margin-bottom: 8px;
                                font-size: 20px;
                                text-align: justify;
                            }

                            span.overview {
                                color: rgb(119, 240, 230);
                                font-size: 25px;
                            }

                            span.rating {
                                color: rgb(119, 240, 230);
                                font-size: 25px;
                            }

                            span.genres {
                                color: rgb(119, 240, 230);
                                font-size: 25px;
                            }

                            div.trailer {
                                text-align: center;
                                margin-top: 0px;
                                color: rgb(119, 240, 230);
                                font-size: 25px;
                            }

                            iframe {
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                width: 600px;
                                height: 400px;
                            }
                        </style>
                    </head>
                    <body>
                        <h2 class="popup-title">${title}</h2>
                        <img class="popup-poster" src="${'https://image.tmdb.org/t/p/w500' + posterPath}" alt="${title} Poster">
                        <p class="popup-text"><span class="overview">Overview:</span> ${overview}</p>
                        <p class="popup-text"><span class="rating">Rating:</span> ${rating}</p>
                        <p class="popup-text"><span class="genres">Genres:</span> ${getGenreNames(movieGenres)}</p>
                        
                        <div class="trailer">
                            <h3>Trailer:</h3>
                            ${videos.length > 0 ? `<iframe src="https://www.youtube.com/embed/${videos[0].key}" frameborder="0" allowfullscreen></iframe>` : 'No trailer available'}
                        </div>
                    </body>
                </html>
            `;
            popupWindow.document.write(popupContent);
        });
    });
}
function getGenreNames(genres) {
    return genres.map(genre => genre.name).join(', ');
}
function fetchGenreDetails(genreIds, callback) {
    var request = new XMLHttpRequest();

    request.open('GET', 'https://api.themoviedb.org/3/genre/movie/list?api_key=34b86ff762e0eebc040fd48a67041cf8');

    request.onload = function () {
        var response = request.response;
        var parsedData = JSON.parse(response);

        if (parsedData.genres) {
            var genres = parsedData.genres;
            var movieGenres = genres.filter(genre => genreIds.includes(genre.id));
            callback(movieGenres);
        }
    };

    request.send();
}
function fetchMovieVideos(title, callback) {
    var request = new XMLHttpRequest();
    var apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=34b86ff762e0eebc040fd48a67041cf8&query=${encodeURIComponent(title)}`;

    request.open('GET', apiUrl);

    request.onload = function () {
        var response = request.response;
        var parsedData = JSON.parse(response);

        if (parsedData.results && parsedData.results.length > 0) {
            var movieId = parsedData.results[0].id;

            fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=34b86ff762e0eebc040fd48a67041cf8`)
                .then(response => response.json())
                .then(data => {
                    if (data.results) {
                        var videos = data.results.filter(video => video.site === 'YouTube');
                        callback(videos);
                    } else {
                        callback([]);
                    }
                })
                .catch(error => {
                    console.error('Error fetching movie videos:', error);
                    callback([]);
                });
        } else {
            callback([]);
        }
    };

    request.send();
}
