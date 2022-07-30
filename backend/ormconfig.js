module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'test1',
  charset: 'utf8',
  driver: 'postgres',
  entities:[
    '**/**.entity.ts'
    // '**/**.entity.js'
  ],
  connectTimeout: 30000,
  acquireTimeout: 30000
};
