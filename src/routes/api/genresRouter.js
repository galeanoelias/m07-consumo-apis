const express = require('express');
const router = express.Router();
const apiGenresController = require('../../controllers/api/genresController');

router.get('/api/genres', apiGenresController.list);
router.get('/api/genres/:id', apiGenresController.detail)
router.get('/api/genres/:id/movies', apiGenresController.genreMovies);

module.exports = router;