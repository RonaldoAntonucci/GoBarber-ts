import User from '@modules/users/infra/typeorm/entities/User';
import { uuid } from 'uuidv4';

import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import AuthenticateUserService from '@modules/users/services/AuthenticateUserService';
import AppError from '@shared/errors/AppError';
import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider';

describe('Authenticate User', () => {
  let service: AuthenticateUserService;
  let repo: FakeUsersRepository;
  let hashProvider: FakeHashProvider;

  beforeEach(() => {
    repo = new FakeUsersRepository();
    hashProvider = new FakeHashProvider();
    service = new AuthenticateUserService(repo, hashProvider);
  });

  it('should be able to Authenticate.', async () => {
    const userPassword = '123456';

    const user = new User();
    Object.assign(user, {
      id: uuid(),
      password: await hashProvider.generateHash(userPassword),
    });

    jest.spyOn(repo, 'findByEmail').mockImplementation(async () => user);

    const auth = await service.run({
      email: 'usermail@email.com',
      password: userPassword,
    });

    expect(auth).toHaveProperty('token');
    expect(auth).toHaveProperty('user');
    expect(auth.user).not.toHaveProperty('password');
    delete user.password;
    expect(auth.user).toEqual(user);
  });

  it('should not be able to Authenticate with non existing user.', async () => {
    await expect(() =>
      service.run({
        email: 'usermail@email.com',
        password: '123456',
      }),
    ).rejects.toEqual(
      new AppError('Incorrect email/password combination.', 401),
    );
  });

  it('should not be able to Authenticate with wrong password.', async () => {
    const user = new User();
    Object.assign(user, {
      id: uuid(),
      password: await hashProvider.generateHash('123456'),
    });

    jest.spyOn(repo, 'findByEmail').mockImplementation(async () => user);

    await expect(() =>
      service.run({
        email: 'usermail@email.com',
        password: 'wrong-password',
      }),
    ).rejects.toEqual(
      new AppError('Incorrect email/password combination.', 401),
    );
  });
});
