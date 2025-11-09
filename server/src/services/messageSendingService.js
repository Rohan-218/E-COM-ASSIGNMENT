import {
  formatErrorResponse, HttpException,
  MESSAGE_TYPES, EmailClient,
} from '../utils';

const { Container } = require('typedi');

export default class MessageSendingService {
  static sendMessageException(error) {
    return new HttpException.ServerError(formatErrorResponse('sendMessage', error));
  }

  static async sendMessage(content, receiver, messageSendType) {
    if (!receiver || receiver.length === 0) {
      throw MessageSendingService.sendMessageException('invalidReceiver');
    }

    let messageResponse;
    // As SonarQube requires to have at least 3 cases to use
    // Switch case, making it if else for now
    if (messageSendType === MESSAGE_TYPES.EMAIL) {
      messageResponse = await this.sendEmailMessage(content, receiver);
      return messageResponse;
    }
    throw MessageSendingService.sendMessageException('invalidMessageType');
  }

  static async sendEmailMessage(message, receiver) {
    let formattedMessage;
    try {
      formattedMessage = await message.getFormattedMessage();
    } catch (err) {
      console.error(err);
      throw MessageSendingService.sendMessageException('formattedMessage');
    }

    const subject = message.getSubject();

    if (!subject || subject.length === 0) {
      throw MessageSendingService.sendMessageException('invalidSubject');
    }

    if (!receiver || receiver.length === 0) {
      throw MessageSendingService.sendMessageException('invalidReceiver');
    }

    const emailClient = Container.get(EmailClient);
    return await emailClient.sendEmail(subject, formattedMessage, receiver);
  }
}
