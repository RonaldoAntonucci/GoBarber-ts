import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import FakeMailProvider from '@shared/container/providers/MailProvider/fakes/FakeMailProvider';
import SendForgotPasswordEmailService from '@modules/users/services/SendForgotPasswordEmailService';
import IMailProvider from '@shared/container/providers/MailProvider/models/IMailProvider';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUserRepository';
import IUserTokenRepository from '../repositories/IUserTokensRepository';
import User from '../infra/typeorm/entities/User';
import FakeUserTokensRepository from '../repositories/fakes/FakeUserTokensRepository';

describe('SendForgotPasswordEmailService', () => {
  let service: SendForgotPasswordEmailService;
  let repo: IUsersRepository;
  let userTokensRepo: IUserTokenRepository;
  let mailProvider: IMailProvider;

  beforeEach(() => {
    repo = new FakeUsersRepository();
    mailProvider = new FakeMailProvider();
    userTokensRepo = new FakeUserTokensRepository();

    service = new SendForgotPasswordEmailService(
      repo,
      mailProvider,
      userTokensRepo,
    );
  });

  it('should be able to recover the password using the email.', async () => {
    const userEmail = 'email@teste.com';
    const userId = 'uuid';

    const checkUserExists = jest
      .spyOn(repo, 'findByEmail')
      .mockImplementation(async () => {
        const user = new User();
        user.id = userId;
        user.email = userEmail;
        return user;
      });

    const generateToken = jest.spyOn(userTokensRepo, 'generate');

    const sendEmail = jest.spyOn(mailProvider, 'sendMail');

    await service.run({
      email: userEmail,
    });
    expect(checkUserExists).toBeCalledWith(userEmail);
    expect(generateToken).toBeCalledWith(userId);
    expect(sendEmail).toBeCalled();
  });

  it('should not be able to recover a non-existing user password.', async () => {
    const sendEmail = jest.spyOn(mailProvider, 'sendMail');

    await expect(() =>
      service.run({
        email: 'email@teste.com',
      }),
    ).rejects.toEqual(new AppError('User does not exists.'));

    expect(sendEmail).not.toBeCalled();
  });
});
