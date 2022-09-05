import { Request, Response, NextFunction } from "express"
import { unless } from "express-unless"

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    //authenticated
    //condition : client got session and user data
    if (req.session && req.session.user) {
        return next()
    }
    //not authenticated redirect to signin page
    else {
        res.redirect("/auth/signin")
        return
    }
}

//for except authentication router
isAuthenticated.unless = unless