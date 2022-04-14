const db = require('../../database/models');

const getUrl = (req) => `${req.protocol}://${req.get('host')}${req.originalUrl}`

module.exports = {
    getAll: async (req, res) => {
        try {
            let movies = await db.Movie.findAll({
                include: [
                    { association: 'genre' },
                    { association: 'actors' }
                ]
            });
            res.json({
                meta: {
                    endpoint: getUrl(req),
                    status: 200,
                    total: movies.length
                },
                data: movies
            });
        } catch (error) {
            if (error.name === 'SequelizeConnectionRefusedError') {
                res.status(500).json({ msg: "Tenemos un error, disculpe"})
            }
        }
    },
    getOne: (req, res) => {
        if(req.params.id % 1 !== 0 || req.params.id < 0){
            return res.status(400).json({
                meta: {
                    status: 400,
                    msg: 'Wrong ID',
                }
            })
        } else {
            db.Movie.findOne({
                where: {
                    id: req.params.id,
                },
                include: [
                    {association: 'genre'}, 
                    {association: 'actors'}
                ] 
            })
            .then((movie) => {
                if(movie){
                    return res.status(200).json({
                        meta: {
                            endpoint: getUrl(req),
                            status: 200,
                        }, 
                        data: movie
                    })
                }
                else {
                    return res.status(400).json({
                        meta: {
                            status: 400,
                            msg: 'ID not found'
                        }
                    })
                }
            })
            .catch((error) => res.status(500).send(error))
        }
    },

    recomended: (req, res) => {
        db.Movie.findAll({
            include: ['genre'],
            where: {
                rating: {[db.Sequelize.Op.gte] : req.params.rating}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
        .then(movies => {
            let respuesta = {
                meta: {
                    status : 200,
                    total: movies.length,
                    url: 'api/movies/recomended/:rating'
                },
                data: movies
            }
                res.json(respuesta);
        })
        .catch(error => console.log(error))
    },

    add: async (req, res) => {
        const { title, rating, awards, release_date, length, genre_id } = req.body
        try {
            let movie = await db.Movie.create({
                title,
                rating,
                awards,
                release_date,
                length,
                genre_id
            });
            res.status(201).json({
                meta: {
                    endpoint: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
                    msg: 'Movie added succesfully'
                },
                data: movie,
            });
        } catch (error) {
            switch (error.name) {
                case 'SequelizeValidationError':
                    let errorsMsg = [];
                    let notNullErrors = [];
                    let validationsErrors = [];
                    error.errors.forEach((error)=> {
                        errorsMsg.push(error.message);
                        if(error.type == 'Validation error') {
                            validationsErrors.push(error.message);
                        }
                        if(error.type == 'notNull Violation') {
                            notNullErrors.push(error.message);
                        }
                    });
                    let response = {
                        status: 400,
                        message: 'missing or wrong data',
                        errors:  {
                            quantity: errorsMsg.length,
                            msg: errorsMsg,
                            notNull: notNullErrors,
                            validation: validationsErrors
                        }
                    }
                    return res.status(400).json(response);
                default: 
                        return res.status(500).json(error)
            }
        }
    },

    update: (req,res) => {
        let movieId = req.params.id;
        db.Movie.update(
            {
                title: req.body.title,
                rating: req.body.rating,
                awards: req.body.awards,
                release_date: req.body.release_date,
                length: req.body.length,
                genre_id: req.body.genre_id
            },
            {
                where: {id: movieId}
        })
        .then(confirm => {
            let respuesta;
            if(confirm){
                respuesta ={
                    meta: {
                        status: 200,
                        total: confirm.length,
                        url: 'api/movies/update/:id'
                    },
                    data:confirm
                }
            }else{
                respuesta ={
                    meta: {
                        status: 204,
                        total: confirm.length,
                        url: 'api/movies/update/:id'
                    },
                    data:confirm
                }
            }
            res.json(respuesta);
        })    
        .catch(error => res.send(error))
    },

    delete: (req, res) => {
        db.Movie.destroy({
            where: {
                id: req.params.id,
            },
        })
        .then(result => {
            if(result){
                return res.status(200).json({
                    msg: 'Movie deleted successfully',
                })
            }else{
                return res.status(200).json({
                    msg: 'no changes',
                });
            }
        })
        .catch((error) => res.status(500).send(error))
    }
}