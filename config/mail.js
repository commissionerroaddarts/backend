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


  // const header = `<!DOCTYPE html>
  //   <html lang="en">
  //   <head>
  //     <meta charset="UTF-8">
  //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //     <title>Welcome to Road Dart</title>

  //     <!-- Google Fonts -->
  //     <link href="https://fonts.googleapis.com/css2?family=Bitter:wght@600&family=Pacifico&family=Ubuntu:wght@300&display=swap" rel="stylesheet">

  //     <style>
  //       body {
  //         margin: 0;
  //         padding: 0;
  //         font-family: Arial, Helvetica, sans-serif;
  //         background-color: #F7F8F9;
  //         color: #000;
  //       }

  //       .container {
  //         max-width: 500px;
  //         margin: 0 auto;
  //         background-color: transparent;
  //         padding: 10px;
  //       }

  //       .container img {
  //         width: 100%;
  //         height: auto;
  //         max-width: 500px;
  //         display: block;
  //         margin: 0 auto;
  //       }

  //       h1 {
  //         font-family: 'Pacifico', cursive;
  //         font-size: 28px;
  //         line-height: 1.4;
  //         margin: 10px 0;
  //       }

  //       p {
  //         font-size: 14px;
  //         font-family: 'Bitter', serif;
  //         line-height: 1.4;
  //         margin: 10px 0;
  //         weight: 400;
  //       }

  //       .button {
  //         display: inline-block;
  //         background-color: #ebebeb;
  //         text-decoration: none;
  //         font-family: 'Ubuntu', sans-serif;
  //         font-weight: 700;
  //         font-size: 14px;
  //         padding: 10px 20px;
  //         border-radius: 4px;
  //         margin-top: 10px;
  //       }
  //     </style>
  //   </head>
  //   <body>

  //     <div class="container">
  //     <img src="https://res.cloudinary.com/dfdlxyml9/image/upload/v1747941134/road-darts-logo_exdydk.png" alt="Road Dart" style="max-width: 200px; height: auto; display: block; margin: 0 auto;"  >
  //     `
  // <img src="https://res.cloudinary.com/dfdlxyml9/image/upload/v1747412127/roaddarts_wwhyzt.jpg" alt="Road Dart">
  // const body = `    <h1>{{heading}}</h1>

  //       <p>{{text}}</p>

  //       <a href="{{buttonlink}}" class="button">{{buttontext}}</a>
  //   `
  // const footer = `</div> </body>
  //   </html>`


  const header = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f7efff;
            font-family: Arial, sans-serif;
        }

        .email-wrapper {
            width: 100%;
            padding: 40px 0;
            background-color: #f7efff;
        }

        .email-container {
            max-width: 600px;
            background: #fff;
            border-radius: 16px;
            padding: 40px 30px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        }

        .email-content h1 {
            font-size: 28px;
            color: #000;
            margin: 0;
            font-weight: 700;
        }

        .email-content p {
            color: #353535;
            font-size: 16px;
            line-height: 1.6;
            margin: 10px 0;
        }
        .email-content p:first-of-type {
            font-size: 18px;
            color: #000;
            max-width: 400px;
            margin: 20px;
        }

        .email-content .button {
            display: inline-block;
            margin: 20px 0;
            padding: 12px 24px;
            background-color: #8224e3;
            color: #fff !important;
            border-radius: 9999px;
            text-decoration: none;
            font-weight: bold;
        }

        .social-icons {
            margin-top: 40px;
        }

        .social-icons img {
            margin: 0 8px;
        }

        .email-footer {
            margin-top: 30px;
            font-size: 12px;
            color: #5e5e5e;
        }
    </style>
</head>

<body>
    <table class="email-wrapper" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center">
                <img src="https://roaddarts.com/images/logos/road-darts-logo.png" alt="Road Darts Logo" width="120"
                    height="120" style="margin-bottom: 30px;" />

                <table class="email-container" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td align="center" class="email-content">`;



  const footer = `</td>
                    </tr>
                </table>

                <table class="social-icons" cellpadding="0" cellspacing="0">
                    <tr>
                        <td><a href="https://facebook.com"><img
                                    src="https://cdn-icons-png.flaticon.com/512/124/124010.png" width="32" height="32"
                                    alt="Facebook" /></a></td>
                        <td><a href="https://twitter.com"><img
                                    src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="32" height="32"
                                    alt="Twitter" /></a></td>
                        <td><a href="https://linkedin.com"><img
                                    src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="32" height="32"
                                    alt="LinkedIn" /></a></td>
                        <td><a href="https://instagram.com"><img
                                    src="https://cdn-icons-png.flaticon.com/512/174/174855.png" width="32" height="32"
                                    alt="Instagram" /></a></td>
                    </tr>
                </table>

                <p class="email-footer">&copy; 2025 Road Dart | 45 B Road NY, USA</p>
            </td>
        </tr>
    </table>
</body>

</html>`;


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
      html: header + data.html + footer,
    });


    console.log(data.subject + " Email sent to ", data.recipient);
  } catch (error) {
    console.log("Error in mail.js", error.message);
  }
};

export default sendMail;
