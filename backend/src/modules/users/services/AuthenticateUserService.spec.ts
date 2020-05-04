import User from '@modules/users/infra/typeorm/entities/User';

import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import AuthenticateUserService from '@modules/users/services/AuthenticateUserService';
import { uuid } from 'uuidv4';
import { hash } from 'bcryptjs';
// import AppError from '@shared/errors/AppError';

describe('Authenticate User', () => {
  let service: AuthenticateUserService;
  let repo: FakeUsersRepository;

  beforeEach(() => {
    repo = new FakeUsersRepository();
    service = new AuthenticateUserService(repo);
  });

  it('should be able to Authenticate.', async () => {
    const userPassword = '123456';

    jest.spyOn(repo, 'findByEmail').mockImplementation(async () => {
      const user = new User();
      const userData = { id: uuid(), password: await hash(userPassword, 8) };
      Object.assign(user, userData);
      return user;
    });

    const auth = await service.run({
      email: 'usermail@email.com',
      password: userPassword,
    });

    expect(auth).toHaveProperty('token');
    expect(auth).toHaveProperty('user');
    expect(auth.user).not.toHaveProperty('password');
  });
});
