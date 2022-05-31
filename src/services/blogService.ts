import { ObjectId } from "mongodb";
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
            description: comment,
            numLikes: 0,
            numReply: 0,
            author,
            _id: generateUniqueId()
        })
        const satisfyCondition = await blogCommentCollection?.find({
            blogId: new ObjectId(blogId),
            count: {
                $lt: 50
            }
        }).toArray()
        if (satisfyCondition && satisfyCondition?.length > 0) {
            const updateResult = await blogCommentCollection?.updateOne({
                blogId: new ObjectId(blogId),
                count: {
                    $lt: 50
                }
            }, {
                $addToSet: {
                    comment: commentData
                },
                $set: {
                    updatedAt: new Date(),
                },
                $inc: {
                    count: 1
                }
            })
            console.log(`${updateResult?.matchedCount} result matched with query`)
            console.log(`${updateResult?.modifiedCount} no of record updated`)
            return { message: "updated exiting" }
        } else {
            const lastUpdatedDoc = await blogCommentCollection?.find({
                blogId: new ObjectId(blogId),
                count: {
                    $eq: 50
                }
            }).sort({ updatedAt: -1 }).limit(1).toArray()
            const lastPage = lastUpdatedDoc && lastUpdatedDoc[0].page
            console.log(`${lastPage} Last page no`)
            const blogToComment = new BlogCommentModel({
                blogId: new ObjectId(blogId),
                count: 1,
                page: lastPage + 1,
                comment: [commentData]
            })
            const blogCommentRecord = await blogCommentCollection?.insertOne(blogToComment)
            console.log(`${blogCommentRecord?.insertedId} record created id`)
            return { message: "created new bucket" }
        }
    }

}