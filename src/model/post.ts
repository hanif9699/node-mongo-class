import { ObjectId } from "mongodb";

export class Post {
    constructor(public name: string,public id?: ObjectId) { }
}