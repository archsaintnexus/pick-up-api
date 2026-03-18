import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: './config.env' })
}

import { Queue } from "bullmq"


const emailQueue = new Queue("emailQueue", {
    connection: {
        host: process.env.REDIS_HOST ?? "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        tls: process.env.NODE_ENV === 'production' ? {} : undefined

    }
})

export default emailQueue