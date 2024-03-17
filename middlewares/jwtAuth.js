import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

const env = dotenv.config().parsed

const jwtAuth = () => {
    return async (req, res, next) => {
        try{
            if(!req.headers.authorization){throw {code: 401, message : 'UNAUTHORIZED'}}

            const token = req.headers.authorization.split(' ')[1]
            const verify = jwt.verify(token, env.JWT_ACCESS_TOKEN_SECRET)

            req.jwt = verify // Data JWT dari user yang login (data req.jwt untuk user yang mau login)
            next()
        }catch(error){
            const errorJwt = ['invalid signature', 'jwt malforward', 'jwt must be provided', 'invalid token']

            if(error.message == 'jwt expired'){
                error.message = 'ACCESS_TOKEN_EXPIRED'
            }else if(errorJwt.includes(error.message)){

                error.message = 'INVALID_ACCESS_TOKEN'
                
            }
            return res.status(error.code || 500)
                            .json({
                                status: false,
                                message: error.message
                            })

        }
    }
}

export default jwtAuth