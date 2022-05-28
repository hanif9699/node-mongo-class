import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export class BlogController {
    public createBlog(req: Request, res: Response, next: NextFunction) {
        const body = req.body;
        const schema = Joi.object().keys({
            title: Joi.string().required(),
            description: Joi.string().required(),
        })
        const result = schema.validate(body)
        if (result.error) {
            res.status(400).send({
                ...result.error.details
            })
        } else {
           res.send('Create Blog Logic')
        }
    }
}