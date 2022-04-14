const db = require('../../database/models');

module.exports = {
    list: async (req, res) => {
        try {
            let genres = await db.Genre.findAll();
            res.json({
                meta: {
                    status: 200,
                    total: genres.length,
                    url: '/api/genres'
                },
                data: genres
            });
        } catch (error) {
            res.send(error.message)
        }
    },
    detail: async (req, res) => {
        try {
            let genre = await db.Genre.findByPk(req.params.id);
            res.json({
                meta: {
                    status: 200,
                    total: genre.length,
                    url: `/api/genres/${req.params.id}`
                },
                data: genre
            });
        } catch (error) {
            res.send(error.message)
        }
    },
    genreMovies: (req, res) => {
        db.Genre.findByPk(req.params.id,{
            include: ['movies']
        })
            .then(genre => {
                let respuesta = {
                    meta: {
                        status: 200,
                        total: genre.length,
                        url: '/api/genre/:id/movies'
                    },
                    data: genre
                }
                res.json(respuesta);
            });
    }

}