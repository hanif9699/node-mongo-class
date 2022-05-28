import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { ObjectId } from "mongodb";
import { Service } from "typedi";
import { User } from "../model/user";
import { JwtService } from "../services/jwtService";
import { UserService } from "../services/userService";
@Service()
export class UserController {
    constructor(private userService: UserService, private jwtService: JwtService) { }
    public getRoot(req: Request, res: Response, next: NextFunction) {
        // console.log(this)
        res.status(200)
        res.send("Sent from controller")
    }
    public protectedFunction(req: Request, res: Response, next: NextFunction) {
        // console.log(this)
        res.status(200)
        res.send("Sent from protected controller")
    }
    public async registerUser(req: Request, res: Response, next: NextFunction) {
        // console.log(this)
        const body = req.body;
        const schema = Joi.object().keys({
            name: Joi.string().required(),
            password: Joi.string().required(),
            mobile_no: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
            emailId: Joi.string().email({ tlds: { allow: false } }).required()
        })
        const result = schema.validate(body)
        if (result.error) {
            res.status(400).send({
                ...result.error.details
            })
        } else {
            const user = new User(body)
            user.password = await user.genHashPasword()
            // console.log(this)
            const response = await this.userService.createUser(user)
            if (response.sucess) {
                const token = await this.jwtService.createToken(response.user as { id: ObjectId })
                res.send({
                    token: token
                })
            } else {
                res.send({
                    error: response.error
                })
            }
        }
    }
    public async loginUser(req: Request, res: Response, next: NextFunction) {
        const body = req.body;
        const schema = Joi.object().keys({
            username: [
                Joi.string().email({ tlds: { allow: false } }).required(),
                Joi.string().length(10).pattern(/^[0-9]+$/).required()
            ],
            password: Joi.string().required()
        })
        const result = schema.validate(body)
        if (result.error) {
            res.status(400).send({
                ...result.error.details
            })
        } else {
            const response = await this.userService.loginUser(body)
            if (response.sucess) {
                const token = await this.jwtService.createToken(response.user as { id: ObjectId })
                res.send({
                    token: token
                })
            } else {
                res.send({
                    error: response.error
                })
            }
        }
    }
    public async findUserById(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const user = await this.userService.getUserById(id)
        if (user) {
            delete user.password;
        }
        res.send({ user })
    }
    public async findUserByEmail(req: Request, res: Response, next: NextFunction) {
        const { email } = req.params;
        const response = await this.userService.getUserByEmail(email)
        if (response && response?.length > 0) {
            const user = response[0]
            delete user.password
            res.send({ user })
        }else{
            res.send('User not Found !!')
        }
        
    }
    public async findUserByMobile(req: Request, res: Response, next: NextFunction) {
        const { mobile } = req.params;
        const response = await this.userService.getUserByMobile(mobile)
        if (response && response?.length > 0) {
            const user = response[0]
            delete user.password
            res.send({ user })
        }else{
            res.send('User not Found !!')
        }
    }
}