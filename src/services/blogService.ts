import { Service } from "typedi";
import { MongodbInstance } from "../db/db";
import { generateUniqueId } from "../helper";
import { BlogModel } from "../model/blog";
import { BlogCommentModel, CommentModel } from "../model/comment";
import { UserService } from "./userService";

@Service()
export class BlogService {
    constructor(private userService: UserService) { }

    public async createBlog({ title, description, author }: any) {
        const client = (await MongodbInstance.getInstance()).client;
        const db = (await MongodbInstance.getInstance()).db
        const blogCollection = await db?.collection('blogs')
        const blogCommentCollection = await db?.collection('blog_comments')
        const blog = new BlogModel({
            title,
            description,
            author,
            numComments: 0,
            numLikes: 0
        })

        const session = client?.startSession()
        const transactionOptions: any = {
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' }
        };
        try {
            await session?.withTransaction(async () => {
                const success = await blogCollection?.insertOne(blog)
                console.log(`${success?.insertedId} id of the inserted record`)
                const blogToComment = new BlogCommentModel({
                    blogId: success?.insertedId,
                    count: 0,
                    page: 0
                })
                const blogCommentRecord = await blogCommentCollection?.insertOne(blogToComment)
                console.log(`${blogCommentRecord?.insertedId} id of the inserted record in blogCommentCollection`)
                const updateUserInfo = await this.userService.incrementTotal(author._id, 1)
                console.log(`${updateUserInfo?.matchedCount} quary matched count`)
                console.log(`${updateUserInfo?.modifiedCount} modified record count`)
            }, transactionOptions)
            await session?.endSession();
            console.log("The reservation was successfully created.");
            return { message: "sucess" }
        } catch (e) {
            await session?.endSession();
            console.log("The transaction was aborted due to an unexpected error: " + e);
            return { message: "Unexpected Error" }
        }
    }

    public async addComment({ blogId, comment, author }: any) {
        const client = (await MongodbInstance.getInstance()).client;
        const db = (await MongodbInstance.getInstance()).db
        const blogCommentCollection = await db?.collection('blog_comments')
        const commentData = new CommentModel({
            ...comment,
            numLikes: 0,
            numReply: 0,
            author,
            id: generateUniqueId()
        })
        // const
    }

}