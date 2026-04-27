// Lambda function to setup RDS database from within AWS VPC
// This bypasses security group issues since Lambda runs inside AWS

const { Client } = require('pg');

exports.handler = async (event) => {
    const client = new Client({
        host: 'database-1.cluster-cul82ke0yunm.us-east-1.rds.amazonaws.com',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: event.masterPassword, // Pass this when invoking
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to RDS');

        // Create user
        await client.query(`
            CREATE USER readypi_user WITH PASSWORD 'ReadyPi2024Secure!' CREATEDB;
        `);
        console.log('User created');

        // Create database
        await client.query(`
            CREATE DATABASE readypi OWNER readypi_user;
        `);
        console.log('Database created');

        // Grant privileges
        await client.query(`
            GRANT ALL PRIVILEGES ON DATABASE readypi TO readypi_user;
        `);
        console.log('Privileges granted');

        await client.end();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Database setup complete',
                credentials: {
                    username: 'readypi_user',
                    password: 'ReadyPi2024Secure!',
                    database: 'readypi'
                }
            })
        };
    } catch (error) {
        console.error('Error:', error);
        await client.end();
        throw error;
    }
};
