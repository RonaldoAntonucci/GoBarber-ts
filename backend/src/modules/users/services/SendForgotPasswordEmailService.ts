import { inject, injectable } from 'tsyringe';

import IMailProvider from '@shared/container/providers/MailProvider/models/IMailProvider';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUserRepository';
import IUserTokensRepository from '../repositories/IUserTokensRepository';
import UserToken from '../infra/typeorm/entities/UserToken';

interface IRequestDTO {
  email: string;
}

@injectable()
class SendForgotPasswordEmailService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('MailProvider')
    private mailProvider: IMailProvider,

    @inject('UserTokensRepository')
    private usersTokenRepository: IUserTokensRepository,
  ) {}

  public async run({ email }: IRequestDTO): Promise<UserToken> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new AppError('User does not exists.');
    }

    const token = await this.usersTokenRepository.generate(user.id);

    this.mailProvider.sendMail(email, 'teste');

    return token;
  }
}

export default SendForgotPasswordEmailService;
