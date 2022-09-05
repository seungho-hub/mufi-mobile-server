import { Request } from "express"
import { FileArray } from "express-fileupload";
import { SessionData } from "express-session"
declare global {
    namespace Express {
        interface Request {
            user: any,
        }
    }
}

declare module 'express-session' {
    export interface SessionData {
        user: { [key: string]: any };
    }
}
