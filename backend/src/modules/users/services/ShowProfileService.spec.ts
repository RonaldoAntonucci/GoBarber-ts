import User from '@modules/users/infra/typeorm/entities/User';

import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import ShowProfileService from '@modules/users/services/ShowProfileService';
import AppError from '@shared/errors/AppError';

describe('ShowProfileService', () => {
  let service: ShowProfileService;
  let repo: FakeUsersRepository;

  beforeEach(() => {
    repo = new FakeUsersRepository();
    service = new ShowProfileService(repo);
  });

  it('should be able to show the profile.', async () => {
    const userId = 'uuid';
    const user = new User();
    user.id = userId;

    const findById = jest
      .spyOn(repo, 'findById')
      .mockImplementation(async () => user);

    const showProfile = await service.run({
      user_id: userId,
    });

    expect(findById).toHaveBeenCalledWith(userId);
    expect(showProfile).toBe(user);
  });

  it('should not be able to show the profile from non-existing user.', async () => {
    const userId = 'uuid';

    const findById = jest
      .spyOn(repo, 'findById')
      .mockImplementation(async () => undefined);

    await expect(service.run({ user_id: userId })).rejects.toEqual(
      new AppError('User not found.'),
    );

    expect(findById).toHaveBeenCalledWith(userId);
  });
});
