const File = require('./models/file');
const fs = require('fs');
const connectDB = require('./config/db');
connectDB();

async function fetchData(){
    // step 1: fetch 24hrs old data
    // step 2: delete it one by one

    const pastDate =  new Date(Date.now() - (24* 60* 60 * 1000))  //24hours in millisecons
    const files = await File.find({ createdAt: { $lt: pastDate }})
    if(files.length){
        for(const file of files){
            try{
                fs.unlinkSync(file.path);
                await file.remove();
                console.log(`successfully deleted ${file.filename}`);
            } catch(err) {
                console.log(`Error while deleting file ${err}`);
            }
        }
        
        console.log('job done!');
    }
}

fetchData().then(process.exit);