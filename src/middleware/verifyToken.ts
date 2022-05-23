import { NextFunction, Request, Response } from "express";
import { Service } from "typedi";
import { JwtService } from "../services/jwtService";
@Service()
export class TokenMiddleware {
    constructor(private jwtService: JwtService) { }
    // private jwtService: JwtService = new JwtService()
    public async verifyToken(req: Request & { user?: string }, res: Response, next: NextFunction) {
        const authorizationHeaader = req.headers.authorization;
        if (authorizationHeaader) {
            const token = authorizationHeaader.split(' ')[1]
            if (!token) {
                res.status(401).send({ message: "Invalid Token" })
            }
            const response = await this.jwtService.verifyToken(token)
            if (response.sucess) {
                req.user = response.decoded
                next()
            } else {
                res.status(401).send({ ...response })
            }

        } else {
            res.status(401).send({ message: "Invalid Token" })
        }
    }
}