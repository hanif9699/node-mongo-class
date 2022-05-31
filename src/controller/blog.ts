import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { Service } from "typedi";
import { BlogService } from "../services/blogService";
import { UserService } from "../services/userService";

@Service()
export class BlogController {
    constructor(private userService: UserService, private blogService: BlogService) { }
    public async createBlog(req: Request & { user?: string }, res: Response, next: NextFunction) {
        const body = req.body;
        const id = req.user;
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
            const userDetails = await this.userService.getUserById(id!)
            const response = await this.blogService.createBlog({ ...body, author: userDetails })
            res.send(response)
        }
    }
    public async addComments(req: Request & { user?: string }, res: Response, next: NextFunction) {
        const body = req.body;
        const id = req.user;
        const schema = Joi.object().keys({
            description: Joi.string().required(),
            blogId: Joi.string().required(),
            replyId: Joi.string(),
        })
        const result = schema.validate(body)
        if (result.error) {
            res.status(400).send({
                ...result.error.details
            })
        } else {
            const userDetails = await this.userService.getUserById(id!)
            const response = await this.blogService.addComment({ blogId: body.blogId, comment: body.description, author: userDetails, replyId: body.replyId })
            res.send(response)
        }
    }
}