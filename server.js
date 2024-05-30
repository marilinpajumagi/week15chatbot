
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    let url = 'https://api.themoviedb.org/3/movie/550988?api_key=4ca94f8b470d7e34bd3f59c3914295c8';
    axios.get(url)
    .then(response => {
        let data = response.data;
        let releaseDate = new Date(data.release_date).getFullYear();
        let genres = '';

        data.genres.forEach(genre => {
            genres = genres + `${genre.name}, `;
        });

        let genresUpdated = genres.slice(0, -2) + '.';
        let moviePoster = `https://image.tmdb.org/t/p/w600_and_h900_bestv2${data.poster_path}`;
        let currentYear = new Date().getFullYear();
        res.render('index', {movieData: data, releaseDate: releaseDate, genres: genresUpdated, poster: moviePoster, year: currentYear});
    }).catch(error => {
        console.error('Error fetching movie data:', error);
        res.status(500).send('Error fetching movie data');
    });
});

// Modified /getmovie route using axios
app.post('/getmovie', (req, res) => {
    const movieToSearch = req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.movie ? req.body.queryResult.parameters.movie : '';

    const reqUrl = encodeURI(`http://www.omdbapi.com/?t=${movieToSearch}&apikey=d5bdccf2`);

    axios.get(reqUrl)
    .then(response => {
        const movie = response.data;
        if (!movie || !movie.Title) {
            return res.json({
                fulfillmentText: 'Sorry, we could not find the movie you are asking for.',
                source: 'getmovie'
            });
        }

        const dataToSend = `${movie.Title} was released in the year ${movie.Year}. It is directed by ${movie.Director} and stars ${movie.Actors}.\n Here some glimpse of the plot: ${movie.Plot}.`;

        return res.json({
            fulfillmentText: dataToSend,
            source: 'getmovie'
        });
    })
    .catch(error => {
        console.error('Error fetching movie data:', error);
        return res.json({
            fulfillmentText: 'Could not get results at this time',
            source: 'getmovie'
        });
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('server is running');
});
