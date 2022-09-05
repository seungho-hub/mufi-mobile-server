// import { Request, Response, NextFunction } from "express"
// export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
//     console.log("req session : ", req.session)
//     if (req.path == "/auth/signin" || req.path == "/auth/signup") return next()

//     //authenticated
//     //condition : client got session and user data
//     if (req.session && req.session.user) {
//         return next()
//     }
//     //not authenticated redirect to signin page
//     else {
//         res.redirect("/auth/signin")
//     }
// }