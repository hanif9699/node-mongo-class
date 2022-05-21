import { ObjectId } from "mongodb";
import { MongodbInstance } from "../db/db";
import { User } from "../model/user";

export class UserService {
    public async createUser(user: { name: string, password: string, mobile_no: number, emailId: string, id?: ObjectId }) {
        const db = (await MongodbInstance.getInstance()).db
        const userCollection = db?.collection('users')
        const resultCount = await userCollection?.countDocuments({
            $or: [
                { mobile_no: user.mobile_no },
                { emailId: user.emailId }
            ]
        })
        if (resultCount! > 0) {
            return { sucess: false, error: 'User already exists', user: { id: '' } }
        } else {
            try {
                const response = await userCollection?.insertOne(user)
                // console.log(response)
                return { sucess: true, error: '', user: { id: response!.insertedId } }
            } catch (e) {
                return { sucess: false, error: 'Error while Creating User', user: { id: '' } }
            }
        }
    }
    public async loginUser({ username, password }: { username: string, password: string }) {
        const db = (await MongodbInstance.getInstance()).db
        const userCollection = db?.collection('users')
        const result = await userCollection?.find({
            $or: [
                { mobile_no: username },
                { emailId: username }
            ]
        }).toArray()
        // console.log(result)
        // return { sucess: false, error: 'User doesnt exists', user: { id: '' } }
        if (result?.length === 0) {
            return { sucess: false, error: 'User doesnt exists', user: { id: '' } }
        } else {
            if (result && result.length > 0) {
                const userFound = new User(result[0] as any)
                if (await userFound.comparePassword(password)) {
                    return { sucess: true, error: '', user: { id: userFound.id } }
                }else{
                    return { sucess: false, error: 'Incorrect Password', user: { id: '' } }
                }
            }else{
                return { sucess: false, error: 'Bad Request', user: { id: '' } }
            }
        }
    }
}