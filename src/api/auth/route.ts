import { Router } from "express"
import {renderSignin, oauthSignin, oauthCallback, signout } from "./controller"

// "/auth/"
export const auth = Router()

auth.get("/signin", renderSignin)

auth.get("/signin/:provider", oauthSignin)

auth.get("/signin/:provider/callback",oauthCallback)

auth.delete('/signout', signout)