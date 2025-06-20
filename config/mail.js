// import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Resend } from "resend";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async (data) => {
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

        
        .support-text{
            font-size: 13px;
            color: #353535;
            line-height: 1.6;
            margin: 10px 0;
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

  const footer = `
  <div class="support-text">
                                Need help? <a href="mailto:support@roaddarts.com">Contact support</a>.
                            </div>
  </td>
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

                <p class="email-footer">&copy; 2025 Road Dart | 11835 Carmel Mountain Rd San Diego, CA  92128
</p>
            </td>
        </tr>
    </table>
</body>

</html>`;

  try {
    const response = await resend.emails.send({
      from: "Road Dart <support@roaddarts.com>",
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
