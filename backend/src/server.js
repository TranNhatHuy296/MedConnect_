const http = require('http');
const app = require('./app');
const { sequelize } = require('./models');
const socketService = require('./services/socketService');
const notificationService = require('./services/notificationService');
const schedulerService = require('./services/schedulerService');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync({ alter: true });
    console.log('Database synced');

    // Tạo HTTP server từ Express app
    const server = http.createServer(app);

    // Khởi tạo Socket.IO
    socketService.init(server);

    // Kết nối notificationService với socketService
    notificationService.setSocketService(socketService);

    // Khởi động cron jobs
    schedulerService.startAllJobs();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
