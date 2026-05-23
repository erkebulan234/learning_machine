const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack}`);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Внутренняя ошибка сервера';

  res.status(status).json({ error: message });
};

const notFound = (req, res) => {
  res.status(404).json({ error: `Маршрут ${req.method} ${req.path} не найден` });
};

module.exports = { errorHandler, notFound };