const express = require("express")
const mysql = require ("mysql")
const cors = require ("cors")
const http = require("http")
const bodyParser = require("body-parser")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const twilio = require("twilio")
const nodemailer = require("nodemailer")
const dotenv = require("dotenv")
const Razorpay = require("razorpay")
const crypto =require ("crypto")
dotenv.config({path:"./.env"})
const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}))
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

const server = http.createServer(app);

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST","PUT","DELETE"],
    credentials: true,
    // origin:"*"
  })
);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DB_DBNAME,
  port: process.env.DB_PORT,
  // host : "db4free.net",
  // user : "kesavan",
  // password : "Kesavan@5",
  // database : "travelixapp",
  // port : 3306
});

connection.connect((error) => {
  if (error) {
    throw error;
  } else {
    console.log("mysql workbench is connected successfully");
  }
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kesavanraj0506@gmail.com",
    pass: "bmffuhcesuumgcux",
  },
});
//  const key_id = process.env.RAZORPAY_KEY_ID;
// const secret = process.env.RAZORPAY_SECRET
//  console.log(key_id,secret)
const accountSid = process.env.accountSid
const authToken = process.env.authToken

const client = twilio(accountSid,authToken);

app.post("/order", async(req,res )=>{
  try{
 const razorpay =  new Razorpay({
     key_id: process.env.RAZORPAY_KEY_ID,
     key_secret: process.env.RAZORPAY_SECRET
    })
   
    const options = {
        amount:req.body.amount,
        currency:req.body.currency,
        receipt:req.body.receiptID
    };
    console.log(options)
    const order = await razorpay.orders.create(options)

    if (!order){
      return res.status(500).send("error")
    }
    else{
      res.status(200).send(order);
  //    const data = req.body;
  //    console.log(data);

  //    const sqlQuery = `insert into mobilerecharge (circle,operator,mobileNumber,rechargeAmount,tpin,rechargeTime,transactionId) values ('${data.circle}','${data.operator}','${data.mobileNumber}','${data.amount}','${data.tpin}',now(),'${data.receiptID}')`;
  //    connection.query(sqlQuery, (error, results) => {
  //   if (error) {
  //     res.status(500).json({ message: "Internal server error" });
  //     return;
  //   } else {
  //     res.status(200).json(results);
  //   }

    
  // });

    }
    

  
  }
  catch(err){
    console.log(err)
    res.status(500).send("error")
  }

   
})

app.post("/order/validate",(req,res)=>{
  const {razorpay_order_id,razorpay_payment_id,razorpay_signature} = req.body;
  const sha = crypto.createHmac("sha256",process.env.RAZORPAY_SECRET);
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest("hex");
  if(digest !== razorpay_signature){
    return res.status(400).send({msg:"Transaction is not legit"})
  }
    res.json({
    msg:"success",
    orderId:razorpay_order_id,
    paymentId:razorpay_payment_id
  })

  // const mailOptions = {
  //   from: "youremail@gmail.com",
  //   to: "kesavanraj338@gmail.com",
  //   subject: `Recharged`,
  //   text: "your request payment successfully recharged",
  // };

  // transporter.sendMail(mailOptions, function (error, info) {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log("Email sent: " + info.response);
  //   }
  // });
  // const amount = `${data.amount}`;
  // const fixedAmount = (amount * 25.3) / 100;
  // const reducedAmount = (amount - fixedAmount).toFixed(2);
  // console.log(reducedAmount);

  // client.messages
  //   .create({
  //     body: `Recharge done on now() MRP:INR ${data.amount}.00.GST 18% payabel by comapny/Distributor/retailer,Talktime:RS ${reducedAmount},Bal:INR,TransID ${transactionId}.Check your balance,validity,tariff and best recharges on ${data.operator} Thanks App.Would you like to refer Airtel Prepaid to your friends & family and save Rs 100 on your next`,
  //     to: "+918525905774", // Text your number
  //     from: "+12512205586", // From a valid Twilio number
  //   })
  //   .then((message) => console.log(message.sid))
  //   .catch((err) => console.log(err));

  
})

app.post("/login", (req, res) => {
  const data = req.body;
  console.log(data);
  connection.query(
    `SELECT * FROM login WHERE userName = '${data.userName}' AND password = '${data.password}'`,
    (error, results) => {
      if (error) {
        res.status(500).json({ message: "Internal server error" });
        return;
      }
      if (results.length === 0) {
        res.status(401).json({ Login: false });
        return;
      }
      // Successful login
      else {
        req.session.userName = results[0].userName;
        res.status(200).json({ Login: true });
        console.log(req.session.userName);
      }
    }
  );
});

app.post("/mobile/recharge", (req, res) => {
  const data = req.body;
  console.log(data);
  const transactionId = Math.floor(Math.random() * (980000 - 960000) + 960000);
  const sqlQuery = `insert into mobilerecharge (circle,operator,mobileNumber,rechargeAmount,tpin,rechargeTime,transactionId) values ('${data.circle}','${data.operator}','${data.mobileNumber}','${data.rechargeAmount}','${data.tpin}',now(),'${transactionId}')`;
  connection.query(sqlQuery, (error, results) => {
    if (error) {
      res.status(500).json({ message: "Internal server error" });
      return;
    } else {
      res.status(200).json(results);
    }

    
  });
});

app.post("/dth/recharge", (req, res) => {
  const data = req.body;
  console.log(data);
  const transactionId = Math.floor(Math.random() * (940000 - 920000) + 920000);
  const sqlQuery = `insert into dthrecharge (operator,dthNumber,dthAmount,tpin,rechargeTime,transactionId) values ('${data.operator}','${data.dthNumber}','${data.dthAmount}','${data.tpin}',now(),'${transactionId}')`;
  connection.query(sqlQuery, (error, results) => {
    if (error) {
      res.status(500).json({ message: "Internal server error" });
      return;
    } else {
      res.status(200).json(results);

      const amount = `${data.rechargeAmount}`;
      const fixedAmount = (amount * 25.3) / 100;
      const reducedAmount = (amount - fixedAmount).toFixed(2);
      console.log(reducedAmount);

      client.messages
        .create({
          body: `Recharge done on now() MRP:INR ${data.dthAmount}.00.GST 18% payabel by comapny/Distributor/retailer Bal:INR,TransID ${transactionId}.Check your balance,validity,tariff and best recharges on ${data.operator} Thanks App.Would you like to refer  Prepaid to your friends & family and save Rs 100 on your next`,
          to: `+91'${data.dthNumber}'`, // Text your number
          from: "+12512205586", // From a valid Twilio number
        })
        .then((message) => console.log(message.sid))
        .catch((err) => console.log(err));
    }

    const mailOptions = {
      from: "youremail@gmail.com",
      to: "kesavanraj338@gmail.com",
      subject: `Recharged`,
      text: "your request payment successfully recharged",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  });
});

app.post("/loadwallet", (req, res) => {
  const data = req.body;
  console.log(data);
  const transactionId = Math.floor(Math.random() * (10000 - 100) + 100);
  const sqlQuery = `insert into loadwallet (depositBank,amount,paymentMode,endingDate,refNo,rechargeTime,paySlip,remarks,transactionId) values ('${data.depositBank}','${data.amount}','${data.paymentMode}','${data.endingDate}','${data.refNo}',now(),'${data.paySlip}','${data.remarks}','${transactionId}')`;
  connection.query(sqlQuery, (error, results) => {
    if (error) {
      res.status(500).json({ message: "Internal server error" });
    } else {
      res.status(200).json(results);
    }
  });
});

app.post("/addMobile", (request, response) => {
  const data = request.body;
  console.log(data);
});

app.get("/list/mobile/recharge", (req, res) => {
  const sqlQuery = `select * from mobilerecharge order by id DESC`;
  connection.query(sqlQuery, (error, results) => {
    if (error) {
      res.status(500).send({
        message: "something went to wrong",
      });
    } else {
      res.status(200).send(results);
    }
  });
});

app.get("/list/dth/recharge", (req, res) => {
  const sqlQuery = `select * from dthrecharge`;
  connection.query(sqlQuery, (error, results) => {
    if (error) {
      res.status(500).send({
        message: "something went to wrong",
      });
    } else {
      res.status(200).send(results);
    }
  });
});

app.get("/list/loadWallet", (req, res) => {
  const sqlQuery = `select * from loadwallet`;
  connection.query(sqlQuery, (error, results) => {
    if (error) {
      res.status(500).json({
        message: "something went to wrong",
      });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get("/", (req, res) => {
  if (req.session.userName) {
    return res.json({ valid: true, userName: req.session.userName });
  } else {
    return res.json({ valid: false });
  }
});

const portNumber = 4000;
server.listen(portNumber, () => {
  console.log("nodejs is working on portnumber 4000");
});

// recovery twilio DLBA5EGEE5SKRJZPNWMQJKAT
