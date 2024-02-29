import express from "express";
import mysql from "mysql";
import cors from "cors";
import http from "http";
import bodyParser from "body-parser";
import session from "express-session";
import cookieParser from "cookie-parser";
import twilio from "twilio";
import nodemailer from "nodemailer"
const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser())
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: false,
  cookie:{
     secure:false,
     maxAge:1000 * 60 * 60 * 24
  }
}));


const server = http.createServer(app);

app.use(
  cors({
    origin:["https://aesthetic-lolly-882870.netlify.app"],
    methods:["GET","POST"],
    credentials: true,
    // origin:"*"

   
  })
);

const connection = mysql.createConnection({
    host : "db4free.net",
    user : "kesavan",
    password : "Kesavan@5",
    database : "travelixapp",
    port : 3306

});

connection.connect((error) => {
  if (error) {
    throw error;
  } else {
    console.log("mysql workbench is connected successfully");
  }
});



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kesavanraj0506@gmail.com',
    pass: 'bmffuhcesuumgcux'
  }
});


const accountSid = 'AC176601214a8c16f269337c1172e2788d';
const authToken = '3f87ab8e009dc0f4ef805003849e86e5';

const client = twilio (accountSid, authToken);


app.post("/login", (req, res) => {
  const data= req.body; 
  console.log(data)
  connection.query(`SELECT * FROM login WHERE userName = '${data.userName}' AND password = '${data.password}'`, (error, results) => {
    if (error) {
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    if (results.length === 0) {
      res.status(401).json({Login: false });
      return;
    }
    // Successful login
    else{
      req.session.userName = results[0].userName;
        res.status(200).json({ Login: true });
        console.log(req.session.userName)
    }
  
  });
});

app.post("/mobile/recharge", (req, res) => {
  const data= req.body; 
  console.log(data)
  const transactionId = Math.floor(Math.random() * (980000 - 960000) + 960000);
  const sqlQuery = `insert into mobilerecharge (circle,operator,mobileNumber,rechargeAmount,tpin,rechargeTime,transactionId) values ('${data.circle}','${data.operator}','${data.mobileNumber}','${data.rechargeAmount}','${data.tpin}',now(),'${transactionId}')`
  connection.query(sqlQuery, (error, results) => {
    if (error) {
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
 
    else{
     res.status(200).json(results);

const amount =`${data.rechargeAmount}`
const fixedAmount = ((amount * 25.3)/100)
const reducedAmount = (amount - fixedAmount).toFixed(2)
console.log(reducedAmount)

     client.messages
     .create({
       body: `Recharge done on now() MRP:INR ${data.rechargeAmount}.00.GST 18% payabel by comapny/Distributor/retailer,Talktime:RS ${reducedAmount},Bal:INR,TransID ${transactionId}.Check your balance,validity,tariff and best recharges on ${data.operator} Thanks App.Would you like to refer Airtel Prepaid to your friends & family and save Rs 100 on your next`,
       to: `+91'${data.mobileNumber}'`, // Text your number
       from: '+12512205586', // From a valid Twilio number
     })
     .then((message) => console.log(message.sid))
     .catch((err) => console.log(err)) 
    }


    const mailOptions = {
      from: 'youremail@gmail.com',
      to: 'kesavanraj338@gmail.com',
      subject: `Recharged`,
      text: 'your request payment successfully recharged'
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  
  });
});

app.post("/dth/recharge", (req, res) => {
  const data= req.body; 
  console.log(data)
  const transactionId = Math.floor(Math.random() * (940000 - 920000) + 920000);
  const sqlQuery = `insert into dthrecharge (operator,dthNumber,dthAmount,tpin,rechargeTime,transactionId) values ('${data.operator}','${data.dthNumber}','${data.dthAmount}','${data.tpin}',now(),'${transactionId}')`
  connection.query(sqlQuery, (error, results) => {
    if (error) {
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
 
    else{
     res.status(200).json(results);

const amount =`${data.rechargeAmount}`
const fixedAmount = ((amount * 25.3)/100)
const reducedAmount = (amount - fixedAmount).toFixed(2)
console.log(reducedAmount)

     client.messages
     .create({
       body: `Recharge done on now() MRP:INR ${data.dthAmount}.00.GST 18% payabel by comapny/Distributor/retailer Bal:INR,TransID ${transactionId}.Check your balance,validity,tariff and best recharges on ${data.operator} Thanks App.Would you like to refer  Prepaid to your friends & family and save Rs 100 on your next`,
       to: `+91'${data.dthNumber}'`, // Text your number
       from: '+12512205586', // From a valid Twilio number
     })
     .then((message) => console.log(message.sid))
     .catch((err) => console.log(err)) 
    }


    const mailOptions = {
      from: 'youremail@gmail.com',
      to: 'kesavanraj338@gmail.com',
      subject: `Recharged`,
      text: 'your request payment successfully recharged'
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  
  });
});

app.post("/loadwallet", (req, res) => {
  const data= req.body; 
  console.log(data)
  const transactionId = Math.floor(Math.random() * (10000 - 100) + 100);
  const sqlQuery = `insert into loadwallet (depositBank,amount,paymentMode,endingDate,refNo,rechargeTime,paySlip,remarks,transactionId) values ('${data.depositBank}','${data.amount}','${data.paymentMode}','${data.endingDate}','${data.refNo}',now(),'${data.paySlip}','${data.remarks}','${transactionId}')`
  connection.query(sqlQuery, (error, results) => {
    if (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
 
    else{
     res.status(200).json(results);
    }
  
  });
});

app.post("/addMobile",(request,response)=>{
  const data=request.body;
  console.log(data)
 
})

app.get("/list/mobile/recharge",(req,res)=>{
  const sqlQuery = `select * from mobilerecharge`;
  connection.query(sqlQuery,(error,results)=>{
    if (error){
      res.status(500).send({
        message:"something went to wrong"
      })
    }
    else{
      res.status(200).send(results)
    }
  })
})

app.get("/list/dth/recharge",(req,res)=>{
  const sqlQuery = `select * from dthrecharge`;
  connection.query(sqlQuery,(error,results)=>{
    if (error){
      res.status(500).send({
        message:"something went to wrong"
      })
    }
    else{
      res.status(200).send(results)
    }
  })
})


app.get("/list/loadWallet",(req,res)=>{
  const sqlQuery = `select * from loadwallet`;
  connection.query(sqlQuery,(error,results)=>{
    if (error){
      res.status(500).json({
        message:"something went to wrong"
      })
    }
    else{
      res.status(200).json(results)
    }
  })
})


app.get("/",(req,res)=>{
  if(req.session.userName){
    return res.json({valid:true,userName:req.session.userName})
  }
  else{
    return res.json({valid:false})
  }
})




const portNumber = 4000;
server.listen(portNumber, () => {
  console.log("nodejs is working on portnumber 4000");
});



// recovery twilio DLBA5EGEE5SKRJZPNWMQJKAT