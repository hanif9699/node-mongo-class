import { Request, Response, NextFunction, Application } from "express";
import { UserController } from "../controller/user";
import { PostController } from "../controller/post";
import { TokenMiddleware } from "../middleware/verifyToken";
import { RateLimiter } from "../middleware/rateLimiter";


export class Routes {
    private userController: UserController = new UserController()
    private postController: PostController = new PostController()
    private verifyTokenMiddlware: TokenMiddleware = new TokenMiddleware()
    private rateLimitMiddleware: RateLimiter = new RateLimiter()
    public routes(app: Application): void {
        // console.log(this,'toute')
        app.get('/',this.rateLimitMiddleware.checkRate,
            this.userController.getRoot.bind(this.userController)
        )
        app.post('/post', this.postController.createPost)
        app.post('/v1/auth/register', this.userController.registerUser.bind(this.userController))
        app.post('/v1/auth/login', this.userController.loginUser.bind(this.userController))
        app.post('/v1/create', this.verifyTokenMiddlware.verifyToken.bind(this.verifyTokenMiddlware), this.userController.protectedFunction.bind(this.userController))
    }

}