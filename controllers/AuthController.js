import User from "../models/User.js"
import emailExist from "../library/emailExist.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'


const env = dotenv.config().parsed

const generateAccessToken = async (payload) => {
    return jwt.sign({id : payload}, 
                    env.JWT_ACCESS_TOKEN_SECRET,
                    {expiresIn: env.JWT_ACCESS_TOKEN_EXPIRATION_TIME})
}

const generateRefreshToken = async (payload) => {
    return jwt.sign({id : payload},
                    env.JWT_REFRESH_TOKEN_SECRET,
                    {expiresIn: env.JWT_REFRESH_TOKEN_EXPIRATION_TIME})
}

class AuthController {
    async register (req, res){
        try{

            if(!req.body.fullname){throw { code : 400, message : 'FULLNAME_IS_REQUIRED'}}
            if(!req.body.email){throw { code : 400, message : 'EMAIL_IS_REQUIRED'}}
            if(!req.body.password){throw { code : 400, message : 'PASSWORD_IS_REQUIRED'}}
            if(req.body.password.length < 6 ){throw { code : 400, message : 'PASSWORD_MINIMUM_6_CHARACTER'}}

            const isemailExist = await emailExist(req.body.email)
            if(isemailExist) {throw {code : 409, message : 'EMAIL_ALREADY_EXIST'} }

            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(req.body.password, salt)

            const user = await User.create({
                fullname : req.body.fullname,
                email : req.body.email,
                password : hash
            })

            if(!user) {throw {code : 500, message : 'USER_REGISTER_FAILED'} }


            return res.status(200)
                        .json({
                            status : true,
                            message : 'USER_REGISTER_SUCCESS',
                            user
                        })
        }catch(error){
            return res.status(error.code || 500)
                        .json( {
                            status : false,
                            message : error.message
                        })
        }
    }

    async login(req, res){
        try{
            if(!req.body.email){throw {code : 400, message : 'EMAIL_IS_REQUIRED'}}
            if(!req.body.password){throw {code : 400, message : 'PASSWORD_IS_REQUIRED'}}

            const user = await User.findOne({ email : req.body.email})
            if(!user){throw{code : 404, message : "USER_NOT_FOUND"}}

            const isPassowordVaild = await bcrypt.compareSync   (req.body.password, user.password)
            if(!isPassowordVaild){throw{code : 400, message : 'INVALID_PASSWORD'}}

            const accessToken = await generateAccessToken({id: user._id})
            const refreshToken = await generateRefreshToken({id: user._id})
            return res.status(200)
                        .json({
                            status : true,
                            message : "USER_LOGIN_SUCCESS",
                            fullname : user.fullname,
                            accessToken,
                            refreshToken
                        })
        }catch(error){
            return res.status(error.code || 500)
                        .json({
                            status : false,
                            message : error.message
                        })
        }
    }

    async refreshToken(req, res){
        try{
            if(!req.body.refreshToken){throw{code : 400, message : 'REFRESH_TOKEN_IS_REQUIRED'}}

            //Verify Refresh Token 
            const verify = await jwt.verify(req.body.refreshToken, env.JWT_REFRESH_TOKEN_SECRET)

            let payload =  {id: verify.id}
            const accessToken = await generateAccessToken(payload)
            const refreshToken = await generateRefreshToken(payload)

            return res.status(200)
                            .json({
                                status : true,
                                message : 'REFRESH_TOKEN_SUCCESS',
                                accessToken,
                                refreshToken
                            })

        }catch(error){

            const errorJwt = ['invalid signature', 'jwt malforward', 'jwt must be provided', 'invalid token']

            if(error.message == 'jwt expired'){
                error.message = 'REFRESH_TOKEN_EXPIRED'
            }else if(errorJwt.includes(error.message)){

                error.message = 'INVALID_REFRESH_TOKEN'
                
            }
            return res.status(error.code || 500)
                            .json({
                                status: false,
                                message: error.message
                            })
        }
        

    } 
}

export default new AuthController()