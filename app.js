import express, {response} from 'express'
import apiRouter from './routes/api.js'
import connection from './connection.js'
import dotenv from 'dotenv'

const env = dotenv.config().parsed
console.log(env)

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/', apiRouter)

//catch invalid page
app.use((req, res) => {
    res.status(404).json({message: '404_Not Found'})
})

//MongoDB Connection
connection()

app.listen(env.APP_PORT, () => {
    console.log(`Server started on port ${env.APP_PORT}`)
})  