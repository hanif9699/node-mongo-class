import { Request, Response, NextFunction, Application } from "express";
import { UserController } from "../controller/user";
import { PostController } from "../controller/post";
import { TokenMiddleware } from "../middleware/verifyToken";
import { RateLimiter } from "../middleware/rateLimiter";
import { Inject, Container } from "typedi";
import { BlogController } from "../controller/blog";


export class Routes {
    // @Inject()
    private userController: UserController = Container.get<UserController>(UserController);
    private postController: PostController = new PostController()
    private verifyTokenMiddlware: TokenMiddleware = Container.get<TokenMiddleware>(TokenMiddleware)
    private rateLimitMiddleware: RateLimiter = new RateLimiter()
    private blogController: BlogController = Container.get<BlogController>(BlogController)
    public routes(app: Application): void {
        // console.log(this,'toute')
        app.get('/', this.rateLimitMiddleware.checkRate,
            this.userController.getRoot.bind(this.userController)
        )
        app.post('/post', this.postController.createPost)
        app.post('/v1/auth/register', this.userController.registerUser.bind(this.userController))
        app.post('/v1/auth/login', this.userController.loginUser.bind(this.userController))
        app.post('/v1/create', this.verifyTokenMiddlware.verifyToken.bind(this.verifyTokenMiddlware), this.userController.protectedFunction.bind(this.userController))
        app.post('/v1/createblog', this.verifyTokenMiddlware.verifyToken.bind(this.verifyTokenMiddlware), this.blogController.createBlog.bind(this.blogController))
        app.get('/v1/user/id/:id', this.userController.findUserById.bind(this.userController))
        app.get('/v1/user/email/:email', this.userController.findUserByEmail.bind(this.userController))
        app.get('/v1/user/mobile/:mobile', this.userController.findUserByMobile.bind(this.userController))
    }

}