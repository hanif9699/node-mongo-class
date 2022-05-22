import * as redis from 'redis'

export class RedisdbInstance {
    private static _instance: RedisdbInstance;
    private _client: redis.RedisClientType | undefined;
    public static async getInstance(): Promise<RedisdbInstance> {
        return new Promise((resolve, reject) => {
            // console.log(this)
            if (this._instance) {
                resolve(this._instance);
            } else {
                this._instance = new RedisdbInstance()
                this._instance._client = redis.createClient({
                    url: ''
                })
                this._instance._client.on('error', (err) => console.log('Redis Client Error', err))
                this._instance._client.connect()
                resolve(this._instance)
            }
        });
    }
    get client(): redis.RedisClientType | undefined {
        return RedisdbInstance._instance._client;
    }
}