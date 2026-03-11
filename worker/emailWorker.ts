import { Worker } from "bullmq"


const emailWorker = new Worker("emailQueue", async (job) => {
    switch (job.name) {
        case "otp": {
            
            break;
        }
        case "resetPassword": {
            
            break;
         }
    }
    
}, {
    connection: {
        host: process.env.REDIS_HOST ?? "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
    }
})



emailWorker.on("completed", (job) => {
    console.log(`Job:${job.id}, completed`)
})


emailWorker.on("failed", (job,err) => {
    console.log(`Job:${job!.id}, failed!`,err)
})

emailWorker.on("progress", (job) => {
    console.log(`Job:${job.id}, in progress`)
})
