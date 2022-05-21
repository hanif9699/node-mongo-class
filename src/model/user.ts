import { ObjectId } from "mongodb";
import bcrypt from "bcrypt"

export class User {
    public name: string;
    public password: string;
    public mobile_no: number;
    public emailId: string;
    public id?: ObjectId;
    public createdAt: Date;
    public updatedAt: Date;
    constructor({ name, password, mobile_no, emailId, id }: { name: string, password: string, mobile_no: number, emailId: string, id?: ObjectId }) {
        this.name = name;
        this.password = password;
        this.mobile_no = mobile_no;
        this.emailId = emailId;
        if (id) {
            this.id = id;
        }
        this.updatedAt = new Date();
        this.createdAt = new Date()
    }
    public genHashPasword() {
        return bcrypt.hash(this.password, bcrypt.genSaltSync(10))
    }
    public comparePassword(password: string) {
        return bcrypt.compare(password, this.password)
    }
}