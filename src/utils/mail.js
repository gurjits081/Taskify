import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';

const sendMail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'Task Manager',
      link: 'https://taskmanager.app',
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailGenContent);
  const emailHtml = mailGenerator.generate(options.mailGenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASSWORD,
    },
  });

  const mail = {
    from: 'support@taskify.app',
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error('Email service failed silently. Please debug the email service.');
    console.error('Error: ', error);
  }
};

const emailVerificationMailGenContent = (username, verificationURL) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our app! We're very excited to have you on board.",
      action: {
        instructions: 'To verify your email please click on the following button:',
        button: {
          color: '#FFC0CB',
          text: 'Verify your email',
          link: verificationURL,
        },
      },
      outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: 'We got a request to reset the password of our account',
      action: {
        instructions: 'To reset your password click on the following button or link:',
        button: {
          color: '#22BC66', // Optional action button color
          text: 'Reset password',
          link: passwordResetUrl,
        },
      },
      outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};


export { emailVerificationMailGenContent, forgotPasswordMailgenContent, sendMail };
