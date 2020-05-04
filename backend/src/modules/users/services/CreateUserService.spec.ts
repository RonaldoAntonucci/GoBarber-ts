import User from '@modules/users/infra/typeorm/entities/User';

import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';

describe('Create User', () => {
  let service: CreateUserService;
  let repo: FakeUsersRepository;

  beforeEach(() => {
    repo = new FakeUsersRepository();
    service = new CreateUserService(repo);
  });

  it('should be able to create a new user.', async () => {
    const user = await service.run({
      name: 'teste',
      email: 'email@teste.com',
      password: '123456',
    });

    expect(user).toBeInstanceOf(User);
    expect(user).toHaveProperty('id');
  });

  it('should not be able to create a new user with same email from another.', async () => {
    jest.spyOn(repo, 'findByEmail').mockImplementation(async () => new User());

    expect(
      service.run({
        name: 'teste',
        email: 'email@teste.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
