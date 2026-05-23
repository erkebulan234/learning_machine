require('dotenv').config();
const app  = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✓ Сервер запущен на порту ${PORT}`);
  console.log(`  Режим: ${process.env.NODE_ENV || 'development'}`);
});

const shutdown = async (signal) => {
  console.log(`\n${signal} получен, завершаем работу...`);
  server.close(async () => {
    await pool.end();
    console.log('✓ Соединения закрыты');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));