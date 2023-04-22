const {MongoClient} = require('mongodb');

const state={
    db:null
}


    const url="mongodb://0.0.0.0:27017"
    const dbname="shopping"
    const client=new MongoClient(url);
    


    



const connect=async (cb)=>{
    try{
        await client.connect();
        const db=client.db(dbname)
        state.db=db;
        return cb();
    }
    catch(err){
        return cb(err)
    }
};
const get=()=>state.db;
    


module.exports={
    connect,
    get,
}