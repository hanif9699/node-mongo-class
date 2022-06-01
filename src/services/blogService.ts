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
            console.log("The Blog was successfully created.");
            return { message: "sucess" }
        } catch (e) {
            await session?.endSession();
            console.log("The transaction was aborted due to an unexpected error: " + e);
            return { message: "Unexpected Error" }
        }
    }

    public async addComment({ blogId, comment, author, replyId }: any) {
        const client = (await MongodbInstance.getInstance()).client;
        const db = (await MongodbInstance.getInstance()).db
        const blogCommentCollection = await db?.collection('blog_comments')
        const blogCollection = await db?.collection('blogs')
        const commentData = new CommentModel({
            description: comment,
            numLikes: 0,
            numReply: 0,
            author,
            _id: generateUniqueId()
        })
        const session = client?.startSession()
        const transactionOptions: any = {
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' }
        };
        try {
            await session?.withTransaction(async () => {
                const satisfyCondition = await blogCommentCollection?.find({
                    blogId: new ObjectId(blogId),
                    count: {
                        $lt: 50
                    }
                }).toArray()
                const updateBlogRecord = await blogCollection?.updateOne({
                    _id: new ObjectId(blogId)
                }, {
                    $inc: {
                        numComments: 1
                    },
                    $set: {
                        updatedAt: new Date()
                    }
                })
                console.log(`${updateBlogRecord?.matchedCount} result matched with query`)
                console.log(`${updateBlogRecord?.modifiedCount} no of record updated`)
                if (satisfyCondition && satisfyCondition?.length > 0) {
                    if (replyId) {
                        const updateParentComment = await blogCommentCollection?.updateMany({
                            blogId: new ObjectId(blogId),
                            comment: {
                                $exists: true,
                            }
                        }, {
                            $inc: {
                                "comment.$[elem].numReply": 1
                            },
                            $set: {
                                updatedAt: new Date()
                            }
                        }, { arrayFilters: [{ "elem.id": replyId }] })
                        console.log(`${updateParentComment?.matchedCount} no of matched blog and comment for this blog ${blogId}`)
                        console.log(`${updateParentComment?.modifiedCount} no of comments updated`)
                    }
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
                    // return { message: "updated exiting" }
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
                    // return { message: "created new bucket" }
                }
            }, transactionOptions)
            await session?.endSession();
            console.log("Added Comment Successfully");
            return { message: "sucess" }
        } catch (e) {
            await session?.endSession();
            console.log("The transaction was aborted due to an unexpected error: " + e);
            return { message: "Unexpected Error" }
        }
    }
    public async editComment({ blogId, commentId, text, authorId }: any) {
        const client = (await MongodbInstance.getInstance()).client;
        const db = (await MongodbInstance.getInstance()).db
        const blogCommentCollection = await db?.collection('blog_comments')
        console.log('Blog Id: ' + blogId)
        console.log('comment id: ' + commentId)
        console.log('comment text: ' + text)
        const updateResult = await blogCommentCollection?.updateOne({
            blogId: new ObjectId(blogId),
            comment: {
                $exists: 1,
                $elemMatch: {
                    "id": commentId,
                    "author.id": authorId
                }
            }
        }, {
            $set: {
                "comment.$[elem].description": text,
                "comment.$[elem].updatedAt": new Date(),
                updatedAt: new Date()
            }
        }, {
            arrayFilters: [{ "elem.id": commentId, "elem.author.id": authorId }]
        })
        console.log(`${updateResult?.acknowledged}`)
        console.log(`${updateResult?.matchedCount} result matched with query`)
        console.log(`${updateResult?.modifiedCount} no of record updated`)
        if (updateResult && updateResult?.matchedCount <= 0) {
            return { message: "Comment doesnt exist with this user" }
        }
        if (updateResult && updateResult.modifiedCount <= 0) {
            return { message: "Unable to modify the comment.Please try again" }
        }
        return { message: "Successfully updated the comment" }
    }
    public async getCommentByBlog(blogId: string, skip: number, limit: number) {
        const client = (await MongodbInstance.getInstance()).client;
        const db = (await MongodbInstance.getInstance()).db
        const blogCommentCollection = await db?.collection('blog_comments')
        const commentRecord = await blogCommentCollection?.find({
            blogId: new ObjectId(blogId)
        }, {
            projection: {
                count: 1,
                comment: {
                    $slice: [skip, limit]
                }
            }
        }).toArray()
        // commentRecord
        return { msg: commentRecord }
    }
}