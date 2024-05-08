import UserModel from "@/model/User.model";
import dbConnect from "@/lib/dbConnect";
import { userNameValidation } from "@/schemas/signUpSchema";
import { z } from 'zod'

const userNameQuerySchema = z.object({
    userName: userNameValidation
})

export async function GET(request: Request) {

    // console.log('first',request.method) // this code in next js not supporting now
    // if(request.method !== 'GET'){
    //     return Response.json({
    //      success:false,
    //      message:"only get method are allowed"
    //     },{status:405})
    // }
    await dbConnect()

    try {

        const { searchParams } = new URL(request.url)
        const queryParam = {
            userName: searchParams.get('userName')
        }
        // validation with zod 
        const result = userNameQuerySchema.safeParse(queryParam)
        console.log('result>>>>', result)  // TODO : reomove it after checking the result log
        if (!result.success) {
            const userNameError = result.error.format().userName?._errors || []
            return Response.json({
                success: false,
                message: userNameError?.length > 0 ? userNameError.join(', ') : "invalid query parameter"
            }, { status: 400 })
        }

        const { userName } = result.data
        const existingVerifiedUserName = await UserModel.findOne({ userName, isVerified: true })
        if (existingVerifiedUserName) {
            return Response.json({
                success: false,
                message: "userName already taken by other user, try another one"
            }, { status: 400 })
        }
        return Response.json({
            success: true,
            message: "userName available"
        }, { status: 200 })
    } catch (error) {
        console.log('error in checking userName', error)
        return Response.json({
            success: false,
            message: "Got error in checking userName"
        }, { status: 500 })
    }
}