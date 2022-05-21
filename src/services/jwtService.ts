import { MongodbInstance } from "../db/db";
import jwt from 'jsonwebtoken'
import { ObjectId } from "mongodb";
export class JwtService {
    public async createToken(user: { id: ObjectId }) {
        const db = (await MongodbInstance.getInstance()).db
        const tokenCollection = await db?.collection('token')
        // console.log(process.env.tokenSecret)
        // console.log(user.id)
        const token = await jwt.sign({
            userId: user.id
        }, process.env.tokenSecret as string, {
            expiresIn: '1d'
        })
        const tokenDocument = new TokenModel({
            token,
            userId: user.id
        })
        await tokenCollection?.insertOne(tokenDocument)
        return token
    }
    public async verifyToken(token: string) {
        const db = (await MongodbInstance.getInstance()).db
        const tokenCollection = await db?.collection('token')
        try {
            const decoded = await jwt.verify(token, process.env.tokenSecret as string) as any
            if (decoded) {
                console.log('decode', decoded.userId)
                const userCollection = await db?.collection('users')
                const findUser = await userCollection?.find({ _id: new ObjectId(decoded.userId) }).toArray()
                console.log(findUser)
                if (findUser && findUser.length > 0) {
                    const findTokenRecord = await tokenCollection?.find({ token, userId: new ObjectId(decoded.userId) }).toArray()
                    console.log(findTokenRecord)
                    if (findTokenRecord && findTokenRecord.length > 0) {
                        const expiry = findTokenRecord[0].expiry
                        const currentTime = new Date().getTime()
                        if (currentTime > expiry) {
                            return { sucess: false, error: 'Token Expired 3' }
                        } else {
                            const remainingTime = expiry - currentTime
                            const newExpiry = expiry + (15 * 60 * 1000 - remainingTime)
                            await tokenCollection?.updateOne({ _id: findTokenRecord[0]._id }, {
                                $set: {
                                    expiry: newExpiry,
                                    updatedAt: new Date()
                                }
                            })
                            console.log('hi')
                            return { sucess: true, error: '', decoded: decoded.userId }
                        }
                    } else {
                        return { sucess: false, error: 'Invalid Token 1' }
                    }
                    // return { sucess: true, error: '', decoded: decoded.userId }
                } else {
                    return { sucess: false, error: 'Invalid Token 2' }
                }
            } else {
                return { sucess: false, error: 'Token Expired 1' }
            }
        } catch (e) {
            return { sucess: false, error: 'Token Expired 2' }
        }
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

