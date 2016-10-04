var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

var Verify = require('./verify');

favoriteRouter.route('/')
.get( function (req, res, next) {
    Favorites.findOne({'postedBy': req.decoded._id})
        .populate('postedBy')
        .populate('dishes')
        .exec(function (err, favorite) {
        if (err) throw err;
        res.json(favorite);
    });
})

.post(function (req, res, next) {
    var dishid = req.body._id;
    req.body._id = req.decoded._id;
    
    Favorites.findOne({'postedBy': req.decoded._id}, function(err, favorite) {
        if (favorite) {
            req.body._id = dishid;
            var id = favorite._id;
            favorite.dishes.push(req.body);
            favorite.save(function (err, favorite) {
                if (err) throw err;
                console.log('Updated favorite with id: ' + id);
                res.json(favorite);
            });             
        }
        else {            
           Favorites.create(req.body, function (err, favorite) {
                if (err) throw err;
                console.log('Favorite created!');
                var id = favorite._id;

                favorite.postedBy = req.decoded._id;

                req.body._id = dishid;
                favorite.dishes.push(req.body);

                favorite.save(function (err, favorite) {
                    if (err) throw err;
                    console.log('Updated favorite with id: ' + id);
                    res.json(favorite);
                });        
            });            
        }       
    });
    
 
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.findOneAndRemove({'postedBy': req.decoded._id}, function(err, resp) {
        if (err) throw err;
         console.log('Favorites deleted!');
        res.json(resp);
    });
});

;



favoriteRouter.route('/:dishId')
.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.findOne({'postedBy': req.decoded._id}, function(err, favorite) {
        if (err) throw err;
        for (var i = (favorite.dishes.length - 1); i >= 0; i--) {
            if(favorite.dishes[i] == req.params.dishId) {
                favorite.dishes.pull(favorite.dishes[i]);
                console.log('Favorite deleted' + req.params.dishId);
            }
        }
                favorite.save(function (err, favorite) {
                    if (err) throw err;
                    console.log('Updated favorites');
                    res.json(favorite);
                });    
    });
});

;

module.exports = favoriteRouter;
