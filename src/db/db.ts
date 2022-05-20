import * as mongoDB from "mongodb"
export class MongodbInstance {
    private static _instance: MongodbInstance;
    private _client: mongoDB.MongoClient | undefined;
    private _db: mongoDB.Db | undefined;
    public static async getInstance(): Promise<MongodbInstance> {
        return new Promise((resolve, reject) => {
            // console.log(this)
            if (this._instance) {
                resolve(this._instance);
            } else {
                this._instance = new MongodbInstance()
                this._instance._client = new mongoDB.MongoClient(process.env.DB_CONN_STRING as string);
                this._instance._client.connect((error, client) => {
                    // console.log(client)
                    if (error) {
                        reject(error);
                    }
                    this._instance._db = this._instance._client!.db(process.env.DB_NAME);
                    resolve(this._instance);
                });
            }
        });
    }
    get db(): mongoDB.Db | undefined {
        return MongodbInstance._instance._db;
    }
    get client(): mongoDB.MongoClient | undefined {
        return MongodbInstance._instance._client;
    }
}
