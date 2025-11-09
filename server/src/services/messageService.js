import MessageSendingService from './messageSendingService';
import { EmailMessage } from '../models';
import config from '../config';
import { MESSAGE_TYPES, sanitizeUrl } from '../utils';

class MessageService {
  static PASSWORD_RESET_EMAIL = '/templates/email/password-reset.hbs';

  static INVITE_USER_EMAIL = '/templates/email/invite-user.hbs';

  static async sendPasswordReset(user, tokenDto) {
    const subject = 'Reset Password';
    const path = '/reset-password';
    const data = {
      firstName: user.firstName,
      url: `${sanitizeUrl(config.url.appBaseUrl)}${path}/${tokenDto.token}`,
      validity: ((tokenDto.validitySeconds) / 60),
    };
    const message = new EmailMessage(subject, MessageService.PASSWORD_RESET_EMAIL, data);
    return await MessageService.sendEmail(message, user.email);
  }

  static async sendEmail(message, email) {
    try {
      return await MessageSendingService.sendMessage(message, email, MESSAGE_TYPES.EMAIL);
    } catch (err) {
      console.log(`Error sending message for ${email}: ${err.message}`);
    }
    return false;
  }

  static async sendAddUserConfirmationEmail(user) {
    const subject = 'Welcome To Memorres';
    const path = '/login';
    const data = {
      name: user.name,
      password: user.actualPassword,
      email: user.email,
      url: `${sanitizeUrl(config.url.appBaseUrl)}${path}`,
    };
    const message = new EmailMessage(subject, MessageService.INVITE_USER_EMAIL, data);
    await MessageService.sendEmail(message, user.email);
  }
}

export default MessageService;
