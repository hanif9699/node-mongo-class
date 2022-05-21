import { Request, Response, NextFunction, Application } from "express";
import { UserController } from "../controller/user";
import { PostController } from "../controller/post";
import { TokenMiddleware } from "../middleware/verifyToken";


export class Routes {
    private userController: UserController = new UserController()
    private postController: PostController = new PostController()
    private verifyTokenMiddlware: TokenMiddleware = new TokenMiddleware()
    public routes(app: Application): void {
        // console.log(this,'toute')
        app.get('/',
            this.userController.getRoot.bind(this.userController)
        )
        app.post('/post', this.postController.createPost)
        app.post('/v1/auth/register', this.userController.registerUser.bind(this.userController))
        app.post('/v1/auth/login', this.userController.loginUser.bind(this.userController))
        app.post('/v1/create', this.verifyTokenMiddlware.verifyToken.bind(this.verifyTokenMiddlware))
    }

}