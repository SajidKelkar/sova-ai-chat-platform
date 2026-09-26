import "dotenv/config";

import app from "./src/app.js";
import connectDb from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";


const startServer = async ()=>{
    try{
        await connectDb();
        await connectRedis();
        
        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
        });

    }
    catch(err){
        console.log(err.message);
    }

};


startServer();