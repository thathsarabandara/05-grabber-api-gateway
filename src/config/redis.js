const redis = require('redis');
const config = require('./index');

const client = redis.createClient({
  url: `redis://${config.redis.host}:${config.redis.port}`
});

client.on('error', (err) => console.log('❌ Redis Client Error', err));
client.on('connect', () => console.log('✅ Redis connected successfully'));

const connectRedis = async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error('❌ Redis Connection error:', error.message);
  }
};

module.exports = {
  client,
  connectRedis
};
