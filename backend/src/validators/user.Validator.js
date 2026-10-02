import {z} from "zod";

export const signupSchema = z.object({
    name: 
        z.string()
        .trim()
        .min(3, "Minumum length of name should be 3")
        .max(30, "Maximum length of name should be 30"),
    age:
        z.number()
        .min(10,"Minimum age should be 10")
        .max(100,"Maximum age should be 100")
        .optional(),
    email:
        z.preprocess(
            (value)=> typeof value == "string" ? value.trim().toLowerCase():"",
            z.email("Email must be valid")
        ),
    password:
        z.string()
        .min(8)
        .max(30)
        .regex(/[A-Z]/,"Your password should have atleast one capital letter")
        .regex(/[a-z]/,"Your password should have atleast one small letter")
        .regex(/[0-9]/,"Your password should have atleast 1 number")
        .regex(/[^A-Za-z0-9]/, "Your password should have atleast one special character"),
});

export const loginSchema = z.object({
    email:
        z.preprocess(
            (value)=> typeof value == "string" ? value.trim().toLowerCase():"",
            z.email("Email must be valid")
        ),
    password:
        z.string().min(1, "Password is required").max(128),
});