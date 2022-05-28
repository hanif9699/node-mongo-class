import { ObjectId } from "mongodb";

export class AuthorModel {
    public id?: ObjectId;
    public name: string;
    public profilePic: string;
    constructor({ _id, name, profilePic }: { _id?: ObjectId, name: string, profilePic: string }) {
        if (_id) {
            this.id = new ObjectId(_id)
        }
        this.name = name;
        this.profilePic = profilePic;
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
    constructor({ title, numComments, numLikes, description, author, createdAt, updatedAt, _id }: { title: any, numComments: any, numLikes: any, description: any, author: AuthorModel, createdAt: Date, updatedAt: Date, _id?: ObjectId }) {
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