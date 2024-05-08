import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";

export async function POST(request: Request) {
    await dbConnect()
    try {
        const { userName, code } = await request.json()
        const decodedUserName = decodeURIComponent(userName)
        const user = await UserModel.findOne({ userName: decodedUserName })
        if (!user) {
            return Response.json({
                success: false,
                message: "user not found"
            }, { status: 400 })
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true
            user.save()

            return Response.json({
                success: true,
                message: "user verified successfully"
            }, { status: 200 })
        } else if(!isCodeNotExpired){
            return Response.json({
                success:false,
                message: "verificatio code expired! signup again to get new code"
            },{status:400})
        }else{
            return Response.json({
                success:false,
                message:"Invalid code"
            },{status:400})
        }
    } catch (error) {
        console.error("Got Error in verify user", error)
        return Response.json({
            success: false,
            message: "User account verification failed"
        }, { status: 500 })
    }
}