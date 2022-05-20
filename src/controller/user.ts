import { Request, Response, NextFunction } from "express";
export class UserController {
    public getRoot(req: Request, res: Response, next: NextFunction) {
        res.status(200)
        res.send("Sent from controller")
    }
}