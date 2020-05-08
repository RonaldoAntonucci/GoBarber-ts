/* eslint-disable import/order */
import IUserTokenRepository from '../repositories/IUserTokensRepository';
import FakeUserTokensRepository from '../repositories/fakes/FakeUserTokensRepository';
import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository';
import UserToken from '../infra/typeorm/entities/UserToken';
import ResetPasswordService from '@modules/users/services/ResetPasswordService';
import IUsersRepository from '../repositories/IUserRepository';
import User from '../infra/typeorm/entities/User';
import IHashProvider from '../providers/HashProvider/models/IHashProvider';
import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider';
import AppError from '@shared/errors/AppError';

describe('ResetPasswordService', () => {
  let service: ResetPasswordService;
  let repo: IUsersRepository;
  let userTokensRepo: IUserTokenRepository;
  let hashProvider: IHashProvider;

  beforeEach(() => {
    repo = new FakeUsersRepository();
    userTokensRepo = new FakeUserTokensRepository();
    hashProvider = new FakeHashProvider();

    service = new ResetPasswordService(repo, userTokensRepo, hashProvider);
  });

  it('should be able to reset the password.', async () => {
    const tokenStr = 'token';
    const userId = 'uuid';
    const newPassword = '654321';

    const user = new User();
    user.id = userId;
    user.password = '123456';

    const findUserByToken = jest
      .spyOn(userTokensRepo, 'findByToken')
      .mockImplementation(async str => {
        const token = new UserToken();
        token.token = str;
        token.user_id = userId;
        return token;
      });

    const findUserById = jest
      .spyOn(repo, 'findById')
      .mockImplementation(async () => user);

    const hashPassword = jest.spyOn(hashProvider, 'generateHash');

    const saveUser = jest.spyOn(repo, 'save');

    await service.run({
      password: newPassword,
      token: tokenStr,
    });

    user.password = await hashProvider.generateHash(newPassword);

    expect(findUserByToken).toBeCalledWith(tokenStr);
    expect(findUserById).toBeCalledWith(userId);
    expect(hashPassword).toBeCalledWith(newPassword);
    expect(saveUser).lastCalledWith(user);
  });

  it('should not be able to reset the password with non-existing token', async () => {
    const findUserByToken = jest
      .spyOn(userTokensRepo, 'findByToken')
      .mockImplementation(async () => undefined);

    const token = 'not-exists';

    await expect(() =>
      service.run({ password: '123456', token }),
    ).rejects.toEqual(new AppError('User token does not exists.'));

    expect(findUserByToken).toBeCalledWith(token);
  });

  it('should not be able to reset the password with non-existing user', async () => {
    const user = new User();
    user.id = 'not-exists-user';

    const token = new UserToken();
    token.token = 'uuid';
    token.user_id = user.id;

    const findTokenByToken = jest
      .spyOn(userTokensRepo, 'findByToken')
      .mockImplementation(async () => token);

    const findUserById = jest
      .spyOn(repo, 'findById')
      .mockImplementation(async () => undefined);

    await expect(() =>
      service.run({ password: '123456', token: token.token }),
    ).rejects.toEqual(new AppError('User does not exists.'));

    expect(findTokenByToken).toBeCalledWith(token.token);
    expect(findUserById).toBeCalledWith(user.id);
  });

  it('should not be able to reset the password if passed more than 2 hours.', async () => {
    const user = new User();
    user.id = 'not-exists-user';

    const token = new UserToken();
    token.token = 'uuid';
    token.user_id = user.id;
    token.createdAt = new Date();

    const findTokenByToken = jest
      .spyOn(userTokensRepo, 'findByToken')
      .mockImplementation(async () => token);

    const getDate = jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      const customDate = new Date();

      return customDate.setHours(customDate.getHours() + 3);
    });

    const findUserById = jest
      .spyOn(repo, 'findById')
      .mockImplementation(async () => user);

    await expect(() =>
      service.run({ password: '123456', token: token.token }),
    ).rejects.toEqual(new AppError('Token expired.'));

    expect(findTokenByToken).toBeCalledWith(token.token);
    expect(findUserById).toBeCalledWith(user.id);
    expect(getDate).toBeCalled();
  });
});
