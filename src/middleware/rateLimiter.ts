import { NextFunction, Request, Response } from "express";
import { RedisdbInstance } from "../db/redis";

export class RateLimiter {
    public async checkRate(req: Request, res: Response, next: NextFunction) {
        const client = (await RedisdbInstance.getInstance()).client
        let limiterKey = req.socket.remoteAddress;
        let value = await client?.get(limiterKey as string)
        console.log(value)
        if (value && Number(value) > 100) {
            res.send({
                message: 'Exceeded Limit'
            })
        } else {
            await client?.INCR(limiterKey as string)
            await client?.expire(limiterKey as string, 59)
            // res.send({
            //     message: "Suceess"
            // })
            next()
        }

        // next()
    }
}