// src/templates/otpTemplate.ts
const otpEmailTemplate = (otp: string, userName: string): string => {
    return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
          }
          .container {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            font-size: 24px;
            color: #333;
          }
          .otp {
            font-size: 36px;
            font-weight: bold;
            color: #007bff;
            text-align: left;
            margin: 20px 10px;
          }
          .footer {
            font-size: 14px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="header">Hello ${userName},</h2>
          <p>To complete your verification, please use the following OTP (One-Time Password):</p>
          <div class="otp">${otp}</div>
          <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
          <p class="footer">Thank you for using our service!</p>
        </div>
      </body>
    </html>
  `;
};

export default otpEmailTemplate;
