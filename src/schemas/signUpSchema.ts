import {z} from 'zod'

export const userNameValidation = z
    .string()
    .min(3,"UserName must be atleast 3 characters")
    .max(20,"userName must not be more than 20 characters")
    .regex(/^[a-zA-Z0-9_]{3,20}$/, "UserName must not contain the speical character")


export const signUpSchema = z.object({
    userName : userNameValidation,
    email: z.string().email({message:"invalid email address"}),
    password: z.string().min(5,{message:"password must be at least 5 characters"})

})