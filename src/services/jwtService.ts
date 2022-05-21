import { MongodbInstance } from "../db/db";
import jwt from 'jsonwebtoken'
import { ObjectId } from "mongodb";

export class JwtService {
    public async createToken(user: { id: ObjectId }) {
        const db = (await MongodbInstance.getInstance()).db
        const tokenCollection = await db?.collection('token')
        const token = await jwt.sign({
            userId: user.id
        }, process.env.tokenSecret as string, {
            expiresIn: '15m'
        })
        const tokenDocument = new TokenModel({
            token,
            userId: user.id
        })

        await tokenCollection?.insertOne(tokenDocument)

        return token
    }
}

class TokenModel {
    public userId: ObjectId;
    public id?: ObjectId;
    public token: string;
    public createdAt: Date;
    public updatedAt: Date;
    public expiry: number;
    constructor({ userId, id, token }: { userId: ObjectId, id?: ObjectId, token: string }) {
        this.userId = userId;
        this.token = token;
        this.expiry = new Date().getTime() + 15 * 60 * 1000;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

