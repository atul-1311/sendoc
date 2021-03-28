const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuid4 } = require('uuid');

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.
            originalname)}`;

            cb(null, uniqueName);
    }
})

let upload = multer({
    storage: storage,
    limit: { fileSize: 1000000 * 50},
}).single('myfile');

router.post('/', (req,res)=>{
    
    //store file

    upload(req, res, async (err) => {

        //validate request
        
        if(!req.file){
            return res.json({ error : 'File Not Found'});
        }

        if(err) {
            return res.status(500).send({error: err.message})
        }

    //database store
    const file = new File({
        filename: req.file.filename,
        uuid: uuid4(),
        path: req.file.path,
        size: req.file.size
    });

    const response = await file.save();
    return res.json({ file: `${process.env.APP_BASE_URL}files/${response.uuid}`});
    //http://localhost:3000/files/223344rhdjbjbj93uu4ihi4j4bj4b
    });
    


    //response --> link
});

router.post('/send', async (req,res) => {
    const { uuid, emailTo, emailFrom, sendername } = req.body;

    //validate request
    if(!uuid || !emailTo || !emailFrom || !sendername){
        return res.status(422).send({error : 'All Fields are required !'});
    }

    // get data from database
    const file = await File.findOne({ uuid: uuid });
    if(file.sender) {
        return res.status(422).send({error : 'Email already sent !'});
    }

    file.sender = emailFrom;
    file.sendername = sendername;
    file.receiver = emailTo;
    const response = await file.save();

    // send email
    const sendMail = require('../services/emailService');
    sendMail({
        from: emailFrom,
        to: emailTo,
        subject: 'SenDoc Easy-Share',
        text: `${sendername} has shared a file with you.`,
        html: require('../services/emailTemplate')({
            emailFrom : emailFrom,
            downloadLink: `${process.env.APP_BASE_URL}files/${file.uuid}`,
            size: parseInt(file.size/1000) + 'KB',
            expires: '24 hours'
        })
    });
    return res.send({ success: true });
})

module.exports = router;