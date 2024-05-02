
import { NextAuthOptions } from "next-auth";
import bcrypt from 'bcryptjs'
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                domain: {
                    label: "Domain",
                    type: "text ",
                    placeholder: "CORPNET",
                    value: "CORPNET",
                },
                email: { label: "email", type: "text ", placeholder: "jsmith" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect()
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { userName: credentials.identifier },
                        ]
                    })
                    if (!user) {
                        throw new Error("User not found with provided credentials(email or userName)")
                    }
                    if (!user.isVerified) {
                        throw new Error("Please verify your account before login")
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

                    if (isPasswordCorrect) {
                        return user
                    } else {
                        throw new Error("Incorrect password, entre correct password")
                    }

                } catch (error: any) {
                    throw new Error(error)
                }
            }
        })
    ],
    callbacks: {
        async jwt({user, token }) {
            if(user){
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.userName = user.userName

            }
            return token
        },
        async session({ token, session }) {
            if(token){
                session.user._id = token._id
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.userName = token.userName
            }
            return session
        }
    },
    pages: {
        signIn: '/sign-in',
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
}