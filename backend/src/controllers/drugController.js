const drugService = require('../services/drugService');

const drugController = {
  async getAll(req, res, next) {
    try {
      const { search, disease, page, limit } = req.query;
      const result = await drugService.getAll({ search, disease, page, limit });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const drug = await drugService.getById(req.params.id);
      res.json({ drug });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = drugController;
