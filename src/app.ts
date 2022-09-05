import express from "express"
//import routers
import { auth } from "./api/auth/route"

import path from "path"
import session from "express-session"
import dbConfig from "./api/config/DBConfig"
import createSessionConfig from "./api/config/SessionConfig"
const MySQLStore = require("express-mysql-session")(session)
import { isAuthenticated } from "./api/auth/middleware"
import fileupload from "express-fileupload"

export const app = express()

//set port number
app.set("port", process.env.PORT || 8000)

//set view engine 'ejs'
app.set("view engine", "ejs");

//set views folder for view engine
app.set("views", path.join(__dirname, "../views"))

//static serving
app.use(express.static(path.join(__dirname, "../views", "statics")))
app.use(express.static(path.join(process.env.PWD, "media")))

//enable body parser
app.use(express.urlencoded({ extended: true }))

app.use(fileupload({}))
const sessionStore = new MySQLStore(dbConfig)

app.use(session(createSessionConfig(sessionStore)))

//except auth router from session check middleware
app.use(isAuthenticated.unless({
    path: [/\/auth\/*/],
}))


app.use("/auth", auth)



