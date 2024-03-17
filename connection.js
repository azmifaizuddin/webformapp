import mongoose from 'mongoose'
import dotenv from 'dotenv'

const env = dotenv.config().parsed

const connection = () => {
    mongoose.connect(env.MONGODB_URI, {
        dbName: env.MONGODB_NAME
    })

    const connection = mongoose.connection
    connection.on('error', console.error.bind(console, 'connection error'))
    connection.once('open', () => {
        console.log(`Connected To MongoDB, Database Name : ${env.MONGODB_NAME}`)
    })
}

export default connection