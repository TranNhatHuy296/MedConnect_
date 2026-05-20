const { Op } = require('sequelize');
const { DrugReference } = require('../models');


const drugService = {
  async getAll({ search, disease, page = 1, limit = 50 }) {
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { drug_code: { [Op.like]: `%${search}%` } },
      ];
    }

    if (disease) {
      where.disease = { [Op.like]: `%${disease}%` };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await DrugReference.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      drugs: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    };
  },

  async getById(id) {
    const drug = await DrugReference.findByPk(id);
    if (!drug) {
      const error = new Error('Không tìm thấy thuốc');
      error.status = 404;
      throw error;
    }
    return drug;
  },
};

module.exports = drugService;
