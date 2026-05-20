const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middlewares/errorHandler');
const { sanitizeBody } = require('./middlewares/sanitize');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const medicationLogRoutes = require('./routes/medicationLogRoutes');
const patientViewRoutes = require('./routes/patientViewRoutes');
const { notificationRouter, notificationSettingsRouter } = require('./routes/notificationRoutes');
const drugRoutes = require('./routes/drugRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(sanitizeBody);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/medication-logs', medicationLogRoutes);
app.use('/api/patient', patientViewRoutes);
app.use('/api/notifications', notificationRouter);
app.use('/api/prescriptions', notificationSettingsRouter);
app.use('/api/drugs', drugRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

module.exports = app;
