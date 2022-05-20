import { Request, Response, NextFunction } from "express";
import { MongodbInstance } from "../db/db";
import { Post } from "../model/post";

export class PostController {
    public async createPost(req: Request, res: Response, next: NextFunction) {
        const body = req.body as Post;
        const db = (await MongodbInstance.getInstance()).db
        const postCollection = db?.collection('posts')
        const response = await postCollection?.insertOne(body)

        res
            .status(200)
            .send({
                response
            })
    }
}