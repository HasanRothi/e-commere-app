const Redis = require('ioredis');

let redis: any;
export async function RedisSetup() {
    try {
        redis = new Redis({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
            ...(process.env.REDIS_USER && { username: process.env.REDIS_USER }),
            // username: 'default',
            ...(process.env.REDIS_DB && { db: process.env.REDIS_DB }),
            // db: 0,
            showFriendlyErrorStack: true,
            lazyConnect: true,
            maxRetriesPerRequest: 0,
            ...(process.env.NODE_ENV !== 'development' && { tls: {} }),
        });
        console.log('Redis connected', await redis.ping());
    } catch (error) {
        console.log('Error occurred');
        console.error(error);
    }
}

export const cacheCheck = async (key: String, Model: any) => {
    const value = await redis.get(key);
    if (value) {
        const parseData = await JSON.parse(value);
        return Array.isArray(parseData) ? parseData.map((doc) => new Model(doc)) : new Model(parseData);
    }
    return null;
};

export const cacheInsert = async (key: String, value: any, time = 0) => {
    if (time === 0) {
        await redis.set(key, JSON.stringify(value));
    } else {
        await redis.set(key, JSON.stringify(value), 'EX', time);
    }
};

export const removeCache = async (key: string) => {
    await redis.del(key);
};
// module.exports = { cacheCheck, removeCache };
