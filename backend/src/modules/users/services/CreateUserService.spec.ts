import User from '@modules/users/infra/typeorm/entities/User';

import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';
import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider';

describe('Create User', () => {
  let service: CreateUserService;
  let repo: FakeUsersRepository;
  let hashProvider: FakeHashProvider;

  beforeEach(() => {
    repo = new FakeUsersRepository();
    hashProvider = new FakeHashProvider();
    service = new CreateUserService(repo, hashProvider);
  });

  it('should be able to create a new user.', async () => {
    const userPassword = '123456';
    const user = await service.run({
      name: 'teste',
      email: 'email@teste.com',
      password: userPassword,
    });

    expect(user).toBeInstanceOf(User);
    expect(user).toHaveProperty('id');
    expect(await hashProvider.compareHash(userPassword, user.password)).toBe(
      true,
    );
  });

  it('should not be able to create a new user with same email from another.', async () => {
    jest.spyOn(repo, 'findByEmail').mockImplementation(async () => new User());

    await expect(() =>
      service.run({
        name: 'teste',
        email: 'email@teste.com',
        password: '123456',
      }),
    ).rejects.toEqual(new AppError('Email address already used.'));
  });
});
