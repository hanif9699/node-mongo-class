import { Request, Response, NextFunction, Application } from "express";
import { UserController } from "../controller/user";
import { PostController } from "../controller/post";

export class Routes {
    private userController: UserController = new UserController()
    private postController: PostController = new PostController()
    public routes(app: Application): void {
        app.get('/', this.userController.getRoot)
        app.post('/post', this.postController.createPost)
    }

}