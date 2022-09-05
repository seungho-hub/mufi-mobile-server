import axios from "axios";
import * as qs from "qs";
import User from "../v1/models/User"
import { Request, Response } from "express"

require("dotenv").config()

export const renderSignin = async (req: Request, res: Response) => {
    res.render("oldies/signin_old")
}

export const signout = async (req: Request, res: Response) => {
    req.session.destroy((err) => { })
    res.clearCookie("connect.sid")

    res.redirect("/")
}

export const oauthSignin = async (req: Request, res: Response) => {
    const provider = req.params.provider


    if (Object.keys(api_info).includes(provider) == false) {
        res.status(400).send("잘못된 요청입니다.")
        return
    }

    //redirect client to conscent screen
    res.redirect(getAuthCodeURL(provider))
}

export const oauthCallback = async (req: Request, res: Response) => {
    const { code } = req.query
    const provider = req.params.provider

    //if user request to unregistered oauth service
    if (Object.keys(api_info).includes(provider) == false) {
        res.status(400).send("잘못된 요청입니다.")
        return
    }

    //if code not sended as parameter
    // will be one of the cases below
    // 1. client try to access /auth/google/callback directly withour pass through conscent screen
    // 2. user failed authentication from oauth server  
    if (code == undefined) {
        res.status(400).send("잘못된 요청입니다.")
        return
    }

    //get user profile from oauth server
    getUserProfile({ code: code.toString(), provider })
        .then((profile) => {
            res.send(profile)
        })
        .catch(err => {
            res.status(500).json({
                code: 500,
                message: "해당 서비스에서 계정 정보를 가져오는 도중 문제가 발생했습니다.",
                err: err,
            })
        })
}

export const Errors = {
    getProfileError: new Error("failed get profile from api server")
}

interface API_INFO {
    [key: string]: any,
}

const api_info: API_INFO = {
    "google": {
        app_key: process.env.GOOGLE_APP_KEY,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,

        auth_code_url: "https://accounts.google.com/o/oauth2/v2/auth",
        token_url: "https://oauth2.googleapis.com/token",
        profile_url: "https://people.googleapis.com/v1/people/me",
        getUserProfile: getGoogleUserProfile,

        // id, username, pfp in userinfo.profile 
        // email in userinfo.email
        scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",

        redirect_url: "http://localhost:8000/auth/signin/google/callback",
    },
    "kakao": {
        // app_key: undefined, //kakao api는 app key를 요구하지 않음
        client_id: process.env.KAKAO_CLIENT_ID,
        client_secret: process.env.KAKAO_CLIENT_SECRET,

        auth_code_url: "https://kauth.kakao.com/oauth/authorize",
        token_url: "https://kauth.kakao.com/oauth/token",
        profile_url: "https://kapi.kakao.com/v2/user/me",
        getUserProfile: getKakaoUserProfile,

        // scope: undefined, //kakao는 default로 id, username, email, pfp를 모두 허용

        //Authorization code를 전송받을 url, token은 redirect_url로 명시만
        redirect_url: "http://localhost:8000/auth/signin/kakao/callback",
    }
}


export const RegisteredAPILabels = Object.keys(api_info)

function getGoogleUserProfile(accessToken: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        axios(api_info["google"].profile_url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                key: api_info['google'].app_key,
                personFields: "names,photos,emailAddresses"
            }
        })
            .then((resp) => {
                resolve({
                    id: resp.data.names[0].metadata.source.id,
                    username: resp.data.names[0].displayName,
                    email: resp.data.emailAddresses[0].value,
                    pfp: resp.data.photos[0].url
                })
            })
            .catch(err => {
                reject(err)
            })
    })
}

function getKakaoUserProfile(accessToken: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        axios(api_info["kakao"].profile_url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then((resp) => {
                resolve({
                    id: resp.data.id,
                    username: resp.data.properties.nickname,
                    email: resp.data.kakao_account.email,
                    pfp: resp.data.properties.profile_image,
                })
            })
            .catch(err => {
                reject(err)
            })
    })
}


function generateURL(url: string, params?: Object): string {
    let result: string = "";

    //host
    if (url[url.length - 1] == '/') {
        url = url.substring(0, url.length - 1)
    }

    result += url

    result += "?"

    result += qs.stringify(params)

    return result
}

//other string will be raise error
type provider = "google" | "kakao" | string

type authorization_code = {
    provider: provider,
    code: string,
}


//get access_token, refresh_token from oauth server with authorization code
function getTokens(auth_code: authorization_code): Promise<any> {
    const provider = auth_code.provider

    return axios(api_info[provider].token_url, {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded:charset=utf-8"
        },
        params: {
            code: auth_code.code,
            client_id: api_info[provider].client_id,
            client_secret: api_info[provider].client_secret,
            redirect_uri: api_info[provider].redirect_url,
            grant_type: "authorization_code",
        }
    })
}


export function getAuthCodeURL(provider: provider): string {
    return generateURL(api_info[provider].auth_code_url, {
        client_id: api_info[provider].client_id,
        redirect_uri: api_info[provider].redirect_url,
        response_type: "code",
        scope: api_info[provider].scope
    })
}

//get user information from oauth api server with authorization code
export function getUserProfile(auth_code: authorization_code): Promise<any> {
    return new Promise((resolve, reject) => {
        getTokens(auth_code)
            .then((token_resp) => {
                const accessToken = token_resp.data.access_token
                return api_info[auth_code.provider].getUserProfile(accessToken)
            })
            .then((profile) => {
                resolve(profile)
            })
            .catch((err) => {
                reject(err)
            })
    })
}