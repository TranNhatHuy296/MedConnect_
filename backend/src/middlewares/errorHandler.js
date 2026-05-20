const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => e.message);
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'Dữ liệu đã tồn tại' });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Lỗi hệ thống',
  });
}
module.exports = errorHandler;
