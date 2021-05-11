const express = require("express");
const nodemailer = require("nodemailer");
const fetch = require("isomorphic-unfetch");
require("dotenv").config();

const port = process.env.PORT;
const user = process.env.EMAIL;
const pass = process.env.PASS;

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to Notification App");
});

app.listen(port, () => {
  console.log(`App started at port ${port}`);
  // Call Api every 10 secs
  const interval = setInterval(getData, 10*1000);
});

//NODEMAILER CONFIGURATION
const transporter = nodemailer.createTransport({
  name: "jinsoft.in",
  host: "mail.jinsoft.in",
  port: 587,
  secure: false,
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

//SEND NOTIFICATION
const sendNotification = (data) => {
  // PREPARE the HTML for the email notification
  let html =
    "<b>Covid vaccines are available at the following centers:</b><br/><ol>";
  data.sessions.forEach((session) => {
    html += `<li>
        <p>Address: ${session.address} Pincode: ${session.pincode}</p>
        <p>Minimum Age: ${session.min_age_limit}</p>
        <p>Available Amount: ${session.available_capacity}</p>
        <p>Fee: ${session.fee}</p>
      </li>`;
  });
  html +=
    '</ol><br/><br/><p>Book the vaccine by clicking here: <a href="https://selfregistration.cowin.gov.in/">https://selfregistration.cowin.gov.in/</a>';
  //MAIL data
  const mailData = {
    from: "Covid Alerts <info@jinsoft.in>",
    to: "jinturocks@gmail.com",
    subject: "Covid vaccines available!!",
    text: "Book now",
    html: html,
  };

  transporter.sendMail(mailData, (err, info) => {
    if (err) {
      console.log("Email Error");
    } else {
      console.log({ message: "Mail sent", message_id: info.messageId });
    }
  });
};

//GET DATA FROM API
const URL =
  "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict";
const districtId = "17";
const date = "11-05-2021";

const getData = async () => {
  try {
    const response = await fetch(
      `${URL}?district_id=${districtId}&date=${date}`,
      {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36",
          Accept: "*/*",
          "Accept-Language": "hi_IN",
        },
      }
    );
    console.log(response);
    const data = await response.json();
    //Call the sendNotification function with this data
    sendNotification(data);
  } catch (error) {
    console.log(error);
  }
};
