const express = require('express');
const cors = require('cors');
const pool = require('./database/db');
const courseRoutes = require('./routes/course');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api', courseRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Curriculum API is running...' });
});

const startServer = async () => {
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await pool.query('SELECT NOW()');
            console.log('Connected to PostgreSQL Database successfully.');
            
            app.listen(PORT, () => {
                console.log(`Server is listening on port ${PORT}`);
                console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            });
            break;

        } catch (err) {
            retries++;
            console.error(`Database connection failed. Retrying (${retries}/${maxRetries})...`);
            console.error(`Reason: ${err.message}`);
            
            if (retries === maxRetries) {
                console.error('Could not connect to the database after max retries. Exiting...');
                process.exit(1);
            }

            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
};

startServer();