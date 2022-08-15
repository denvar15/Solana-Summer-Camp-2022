module.exports = {
    type: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'postgres',
    charset: 'utf8',
    entities: ['src/entities/*', 'dist/entities/*'],
    connectTimeout: 30000,
    acquireTimeout: 30000,
};
