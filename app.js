const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require("cors");

const authRoute = require('./routes/User')
const MessageRoute = require('./routes/Message')
const ServiceRoute = require('./routes/Service')
const ProfileRoute = require('./routes/Portifolio');
const Prod = require('./startup/Prod');

dotenv.config()

mongoose
.connect(process.env.DATABASE_URL)
.then(()=> console.log("Db connected"))
.catch((err)=> console.log(err))

const port = process.env.PORT || 3000

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

app.use('/api/v1/team', authRoute)
app.use('/api/v1/message', MessageRoute)
app.use('/api/v1/service', ServiceRoute)
app.use('/api/v1/portifolio', ProfileRoute)
app.use('/api/v1/prod', Prod)
// require('/api/v1/Prod')(app)

app.listen(port, ()=>{
    console.log(`App is runnng on http://locolhost:${port}`)
})