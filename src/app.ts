import { Application } from "express";
import bodyParser from "body-parser";
import express from "express";
import { Routes } from './routes';
import dotenv from 'dotenv'
import { MongodbInstance } from './db/db'
import { RedisdbInstance } from "./db/redis";

class App {

    public app: Application = express();
    private routePrv: Routes = new Routes();

    constructor() {
        dotenv.config()
        this.config();
        this.routePrv.routes(this.app);
        MongodbInstance.getInstance()
        RedisdbInstance.getInstance()
    }

    private config(): void {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(express.static('public'));
    }
}

export default new App().app;