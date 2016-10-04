var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var Promotes = require('../models/promotions');
var Verify = require('./verify');

var promoRouter = express.Router();
promoRouter.use(bodyParser.json());

promoRouter.route('/')
.get(function(req,res,next){
         Promotes.find({}, function (err, promo) {
        if (err) throw err;
        res.json(promo);
    });
})

.post(Verify.verifyAdmin, function(req, res, next){
    Promotes.create(req.body, function (err, promo) {
        if (err) throw err;
        console.log('promo created!');
        var id = promo._id;

        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the promo with id: ' + id);
    });      
})

.delete(Verify.verifyAdmin,function(req, res, next){
        Promotes.remove({}, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});

promoRouter.route('/:promoId')

.get(Verify.verifyOrdinaryUser,function(req,res,next){
    Promotes.findById(req.params.promoId, function (err, promo) {
        if (err) throw err;
        res.json(promo);
    });
})

.put(Verify.verifyAdmin,function(req, res, next){
    Promotes.findByIdAndUpdate(req.params.promoId, {
        $set: req.body
    }, {
        new: true
    }, function (err, promo) {
        if (err) throw err;
        res.json(promo);
    });
})

.delete(Verify.verifyAdmin,function(req, res, next){
    Promotes.findByIdAndRemove(req.params.promoId, function (err, resp) { 
      if (err) throw err;
        res.json(resp);
    });
});

module.exports = promoRouter;

