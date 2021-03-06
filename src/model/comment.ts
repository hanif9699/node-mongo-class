import { ObjectId } from "mongodb";
import { AuthorModel } from "./blog";
export class CommentModel {
    public createdAt: Date;
    public updatedAt: Date;
    public numLikes: number;
    public numReply: number;
    public description: string;
    public replyId?: ObjectId;
    public author: AuthorModel;
    public id?: ObjectId;
    constructor({ numReply, numLikes, description, author, _id, replyId }: { numReply: any, numLikes: any, description: any, author: any, _id?: any, replyId?: ObjectId }) {
        this.author = new AuthorModel(author)
        this.numLikes = numLikes;
        this.numReply = numReply;
        this.description = description;
        if (replyId) {
            this.replyId = replyId
        }
        this.id = _id;
        this.createdAt = new Date()
        this.updatedAt = new Date()
    }
}
export class BlogCommentModel {
    public id?: ObjectId;
    public blogId: ObjectId;
    public count: number;
    public page: number;
    public createdAt: Date;
    public updatedAt: Date;
    public comment?: Array<CommentModel>;
    constructor({ _id, blogId, count, page, comment }: any) {
        if (_id) {
            this.id = _id;
        }
        this.blogId = blogId;
        this.count = count;
        this.page = page;
        if (comment) {
            this.comment = comment
        }
        this.createdAt = new Date()
        this.updatedAt = new Date()
    }
}