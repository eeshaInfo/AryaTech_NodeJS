'use strict';

let modelService = {};

/**
* function to create.
*/
modelService.create = async (model, payload) => {
    return await new model(payload).save();
};

/**
* function to insert.
*/
modelService.insertMany = async (model, payload) => {
    return await model.insertMany(payload);
};

/**
* function to find.
*/
modelService.find = async (model, criteria, projection = {}, sort = {}) => {
    return await model.find(criteria, projection, { sort: sort }).lean();
};

/**
* function to find one.
*/
modelService.findOne = async (model, criteria, projection = {}) => {
    return await model.findOne(criteria, projection).lean();
};

/**
* function to find One with pagination.
*/
modelService.findOnePagination = async (model, criteria, projection = {}, sort = {}) => {
    return await model.find(criteria, projection, { sort: sort }).lean();
};

/**
* function to find with pagination.
*/
modelService.findPagination = async (model, criteria, projection = {}, skip, limit, sort = {}) => {
    return await model.find(criteria, projection).skip(skip).sort(sort).limit(limit).lean();
};

/**
* function to update one.
*/
modelService.findOneAndUpdate = async (model, criteria, dataToUpdate) => {
    return await model.findOneAndUpdate(criteria, dataToUpdate,{ upsert: true, new: true }).lean();
};

/**
* function to update.
*/
modelService.updateMany = async (model, criteria, dataToUpdate) => {
    return await model.updateMany(criteria, dataToUpdate);
};

/**
* function to delete one.
*/
modelService.deleteOne = async (model, criteria) => {
    return await model.deleteOne(criteria);
};

/**
* function to delete.
*/
modelService.deleteMany = async (model, criteria) => {
    return await model.deleteMany(model, criteria);
};

/**
* function to apply aggregate on.
*/
modelService.aggregate = async (model, query) => {
    return await model.aggregate(query);
};


modelService.countDocument = async (model, criteria) => {
    return await model.countDocuments(criteria)
}
module.exports = modelService;