import { ObjectId } from "mongodb";

export class AuthorModel {
    public id?: ObjectId;
    public name: string;
    public email: string;
    constructor({ _id, name, email }: { _id?: ObjectId, name: string, email: string }) {
        if (_id) {
            this.id = new ObjectId(_id)
        }
        this.name = name;
        this.email = email;
    }
}

export class BlogModel {
    public title: string;
    public createdAt: Date;
    public updatedAt: Date;
    public numLikes: number;
    public numComments: number;
    public description: string;
    public author: AuthorModel;
    public id?: ObjectId;
    constructor({ title, numComments, numLikes, description, author, _id }: { title: any, numComments: any, numLikes: any, description: any, author: AuthorModel, _id?: ObjectId }) {
        this.title = title;
        this.author = new AuthorModel(author)
        this.numLikes = numLikes;
        this.numComments = numComments;
        this.description = description;
        if (_id) {
            this.id = _id
        }
        this.createdAt = new Date()
        this.updatedAt = new Date()
    }

}