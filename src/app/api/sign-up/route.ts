import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { error } from "console";
import { string } from "zod";

export async function POST(request: Request) {
    await dbConnect()
    try {
        const { userName, email, password } = await request.json()

        const existingUserVerifiedByUserName = await UserModel.findOne({
            userName,
            isVerified: true
        })
        if (existingUserVerifiedByUserName) {
            return Response.json({
                success: true,
                message: "This userName already exist"
            }, { status: 400 })
        }
        const existingUserByEmail = await UserModel.findOne({ email })

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()


        if (existingUserByEmail) {

            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "Email already in use. Try another."
                }, { status: 400 })
            } else {
                const hashedPassword = await bcrypt.hash(password, 10)
                existingUserByEmail.password = hashedPassword
                existingUserByEmail.verifyCode = verifyCode
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000)
                await existingUserByEmail.save()
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)
            const newUser = new UserModel({
                userName,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })
            await newUser.save()

            // sendVerification email
            const emailResponse = await sendVerificationEmail({
                email,
                userName,
                verifyCode
            })

            if (!emailResponse.success) {
                return Response.json({
                    success: false,
                    message: emailResponse.message
                }, {
                    status: 500
                })
            }
            return Response.json({
                success: true,
                message: "User registerd Succefully, Please verify your email"
            }, { status: 201 })
        }
    } catch (error) {
        console.error("error in registering user", error)
        return Response.json({
            success: false,
            message: "error in registering user"
        }, {
            status: 500
        })
    }
}