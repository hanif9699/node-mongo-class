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
    constructor({ numReply, numLikes, description, author, createdAt, updatedAt, _id, blogId, replyId }: { numReply: any, numLikes: any, description: any, author: AuthorModel, createdAt: Date, updatedAt: Date, _id?: ObjectId, replyId?: ObjectId, blogId: ObjectId }) {
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
    public comments?: Array<CommentModel>;
    constructor({ _id, blogId, count, page, comments }: any) {
        if (_id) {
            this.id = _id;
        }
        this.blogId = blogId;
        this.count = count;
        this.page = page;
        if (comments) {
            this.comments = comments
        }
    }
}