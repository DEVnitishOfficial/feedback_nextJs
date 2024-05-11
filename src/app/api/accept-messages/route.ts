import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { User } from "next-auth"

export async function POST(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "user not authenticated"
        }, { status: 401 })
    }

    const userId = user._id
    const { acceptMessages } = await request.json()

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage: acceptMessages },
            { new: true }
        )
        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "Got error in updating user details"
            }, { status: 401 })
        }
        return Response.json({
            success: true,
            message: "message acceptance status updated successfully",
            updatedUser
        }, { status: 200 })
    } catch (error) {
        console.log('Failed to update the accept user messages')
        return Response.json({
            success: false,
            message: "failed to update the status of user accept messages"
        }, { status: 500 })
    }
}

export async function Get(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "user not authenticated"
        }, { status: 401 })
    }

    const userId = user._id

    try {
        const foundUser = await UserModel.findById(userId)
        if(!foundUser){
            return Response.json({
                success:false,
                message:"user not found"
            },{status:404})
        }
    
        return Response.json({
            success:true,
            isAcceptingMessages : foundUser.isAcceptingMessage
        },{status:200})
    } catch (error) {
        console.error(error)
        return Response.json({
            success:false,
            message:"Error in getting message acceptance status"
        },{status:400})
        
    }
}