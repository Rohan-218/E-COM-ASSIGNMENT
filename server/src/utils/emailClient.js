import config from '../config';

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(config.sendgrid.apiKey);

export default class EmailClient {
  constructor() {
    this.fromEmail = `${config.sendgrid.fromEmail}`;
    this.fromName = `${config.sendgrid.fromName}`;
  }

  async sendEmail(subject, body, to) {
    const mailOptions = {
      to,
      from: {
        name: this.fromName,
        email: this.fromEmail,
      },
      subject,
      html: body,
    };

    return sgMail.send(mailOptions)
      .then((res) => res)
      .catch((err) => err);
  }
}