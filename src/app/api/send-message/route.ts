import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { Message } from "@/model/User.model";

export async function POST(request:Request){
    await dbConnect()

    const {userName,content} = await request.json()
    try {
       const user = await UserModel.findOne({userName})
       if(!user){
        return Response.json({
            success:false,
            message:"User not found"
        },{status:404})
       }
       // is user accepting the messages
       if(!user.isAcceptingMessage){
        return Response.json({
            success:false,
            message:"user not accepting the messages"
        },{status:403})
       }
       const newMessage = {content, createdAt : new Date()}
       user.messages.push(newMessage as Message)
       await user.save()

       return Response.json({
        success: true,
        messages:"message sent successfully"
       },{status:400})
    } catch (error) {
        console.error("An unaccepted error occur")
        return Response.json({
            success:false,
            message:"Internal server Error"
        },{status:500})
    }
}