import User from '@modules/users/infra/typeorm/entities/User';

import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import UpdateUserAvatarService from '@modules/users/services/UpdateUserAvatarService';
import FakeStorageProvider from '@shared/container/providers/StorageProvider/fakes/FakeStorageProvider';
import AppError from '@shared/errors/AppError';

describe('UpdateUserAvatar', () => {
  let service: UpdateUserAvatarService;
  let repo: FakeUsersRepository;
  let storageProvider: FakeStorageProvider;

  beforeEach(() => {
    repo = new FakeUsersRepository();
    storageProvider = new FakeStorageProvider();
    service = new UpdateUserAvatarService(repo, storageProvider);
  });

  it('should be able to update user avatar.', async () => {
    const userId = 'uuid';
    const user = new User();
    user.id = userId;

    const avatarFilename = 'fakeAvatarFilename.png';

    const saveFile = jest.spyOn(storageProvider, 'saveFile');

    const findById = jest
      .spyOn(repo, 'findById')
      .mockImplementation(async () => user);

    const updatedUser = await service.run({ user_id: userId, avatarFilename });

    expect(findById).toHaveBeenCalledWith(userId);
    expect(saveFile).toHaveBeenCalledWith(avatarFilename);
    expect(updatedUser.avatar).toBe(avatarFilename);
  });

  it('should not be able to update avatar from non existing user.', async () => {
    const userId = 'uuid';

    const findById = jest
      .spyOn(repo, 'findById')
      .mockImplementation(async () => undefined);

    await expect(() =>
      service.run({
        user_id: userId,
        avatarFilename: 'fakeAvatarFilename.png',
      }),
    ).rejects.toEqual(
      new AppError('Only authenticated users can change avatar.', 401),
    );
    expect(findById).toHaveBeenCalledWith(userId);
  });

  it('should delete old avatar when updating new one.', async () => {
    const oldAvatarFilename = 'oldAvatarFilename.png';
    const newAvatarFilename = 'newAvatarFilename.png';

    const userId = 'uuid';
    const user = new User();
    user.id = userId;
    user.avatar = oldAvatarFilename;

    const findById = jest
      .spyOn(repo, 'findById')
      .mockImplementation(async () => user);
    const deleteFile = jest.spyOn(storageProvider, 'deleteFile');

    const upatedUser = await service.run({
      user_id: userId,
      avatarFilename: newAvatarFilename,
    });

    expect(findById).toHaveBeenCalledWith(user.id);
    expect(deleteFile).toHaveBeenCalledWith(oldAvatarFilename);

    expect(upatedUser.avatar).toBe(newAvatarFilename);
  });
});
