// import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Resend } from "resend";
dotenv.config();


const resend = new Resend(process.env.RESEND_API_KEY);


// let transporter = null;

// // Create a singleton transporter instance
// const getTransporter = () => {
//   if (!transporter) {
//     transporter = nodemailer.createTransport({
//       // service: "gmail",
//       host: process.env.EMAIL_HOST,
//       port: 587,
//       secure: false, // true for 465, false for other ports
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//       connectionTimeout: 10000,  // 10 seconds
//       greetingTimeout: 5000,     // 5 seconds
//       socketTimeout: 10000,
//       debug: true,
//       logger: true,
//     });
//   }
//   return transporter;
// };



const sendMail = async (data) => {


  const header = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Road Dart</title>
    
      <!-- Google Fonts -->
      <link href="https://fonts.googleapis.com/css2?family=Bitter:wght@600&family=Pacifico&family=Ubuntu:wght@300&display=swap" rel="stylesheet">
    
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, Helvetica, sans-serif;
          background-color: #F7F8F9;
          color: #000;
        }
    
        .container {
          max-width: 500px;
          margin: 0 auto;
          background-color: transparent;
          padding: 10px;
        }
    
        .container img {
          width: 100%;
          height: auto;
          max-width: 500px;
          display: block;
          margin: 0 auto;
        }
    
        h1 {
          font-family: 'Pacifico', cursive;
          font-size: 28px;
          line-height: 1.4;
          margin: 10px 0;
        }
    
        p {
          font-size: 14px;
          font-family: 'Bitter', serif;
          line-height: 1.4;
          margin: 10px 0;
          weight: 400;
        }
    
        .button {
          display: inline-block;
          background-color: #ebebeb;
          text-decoration: none;
          font-family: 'Ubuntu', sans-serif;
          font-weight: 700;
          font-size: 14px;
          padding: 10px 20px;
          border-radius: 4px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
    
      <div class="container">
        <img src="https://res.cloudinary.com/dfdlxyml9/image/upload/v1747412127/roaddarts_wwhyzt.jpg" alt="Road Dart">
    `
  const body = `    <h1>{{heading}}</h1>
    
        <p>{{text}}</p>
    
        <a href="{{buttonlink}}" class="button">{{buttontext}}</a>
    `
  const footer = `</body>
    </html>`


  try {
    // const mailOptions = {
    //   from: process.env.EMAIL_USERNAME,
    //   to: data.recipient,
    //   subject: data.subject,
    //   // text: "",
    //   html: header + data.html + `</div>` + footer,
    // };
    // const transporter = getTransporter();
    // await transporter.verify();
    // console.log("Server is ready to take our messages");
    // const info = await transporter.sendMail(mailOptions);


    const response = await resend.emails.send({
      from: 'Road Dart <support@roaddarts.com>', 
      to: data.recipient,
      subject: data.subject,
      html: header + data.html + `</div>` + footer,
    });


    console.log(data.subject + " Email sent to ", data.recipient);
  } catch (error) {
    console.log("Error in mail.js", error.message);
  }
};

export default sendMail;
