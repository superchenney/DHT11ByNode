var mongoose = require('mongoose');
var models = require("./models");
var Schema = mongoose.Schema;

for (var m in models) {
    mongoose.model(m, new Schema(models[m]));
}



module.exports = {
    getModel: function(type) {
        return _getModel(type);
    },
    fetch: function(cb) {
        return this
            .find({})
            .sort('date')
            .exec(cb)
    },
    findById: function(id, cb) {
        return this
            .findOne({
                _id: id
            })
            .exec(cb)
    }

};

var _getModel = function(type) {
    return mongoose.model(type);
};
