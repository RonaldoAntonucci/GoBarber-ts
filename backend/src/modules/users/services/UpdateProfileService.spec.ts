import User from '@modules/users/infra/typeorm/entities/User';

import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import UpdateProfileService from '@modules/users/services/UpdateProfileService';
import AppError from '@shared/errors/AppError';
import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider';

describe('UpdateProfile', () => {
  let service: UpdateProfileService;
  let repo: FakeUsersRepository;
  let hashProvider: FakeHashProvider;

  beforeEach(() => {
    repo = new FakeUsersRepository();
    hashProvider = new FakeHashProvider();
    service = new UpdateProfileService(repo, hashProvider);
  });

  it('should be able to update the profile.', async () => {
    const userId = 'uuid';
    const user = new User();
    user.id = userId;
    user.email = 'oldMail@email.com';
    user.name = 'oldName';
    user.password = 'oldPassword';

    const findById = jest
      .spyOn(repo, 'findById')
      .mockImplementation(async () => user);

    const checkEmail = jest
      .spyOn(repo, 'findByEmail')
      .mockImplementation(async () => undefined);

    const comparePassword = jest.spyOn(hashProvider, 'compareHash');
    const generateHashPassword = jest.spyOn(hashProvider, 'generateHash');

    const savedUser = jest.spyOn(repo, 'save');

    const newAttrs = {
      email: 'newEmail@email.com',
      name: 'newName',
      password: 'newPassword',
    };

    const updateProfile = await service.run({
      user_id: userId,
      ...newAttrs,
      old_password: user.password,
    });

    expect(findById).toHaveBeenCalledWith(userId);
    expect(checkEmail).toHaveBeenCalledWith(user.email);

    expect(comparePassword).toHaveBeenCalledWith('oldPassword', 'oldPassword');
    expect(generateHashPassword).toHaveBeenCalledWith(newAttrs.password);

    Object.assign(user, newAttrs);

    expect(savedUser).toBeCalledWith(user);
    expect(updateProfile).toBe(user);
  });

  it('should be able to update the profile without password.', async () => {
    const userId = 'uuid';
    const user = new User();
    user.id = userId;
    user.email = 'oldMail@email.com';
    user.name = 'oldName';
    user.password = 'oldPassword';

    const findById = jest
      .spyOn(repo, 'findById')
      .mockImplementation(async () => user);

    const checkEmail = jest
      .spyOn(repo, 'findByEmail')
      .mockImplementation(async () => undefined);

    const comparePassword = jest.spyOn(hashProvider, 'compareHash');
    const generateHashPassword = jest.spyOn(hashProvider, 'generateHash');

    const savedUser = jest.spyOn(repo, 'save');

    const newAttrs = {
      email: 'newEmail@email.com',
      name: 'newName',
    };

    const updateProfile = await service.run({
      user_id: userId,
      ...newAttrs,
    });

    expect(findById).toHaveBeenCalledWith(userId);
    expect(checkEmail).toHaveBeenCalledWith(user.email);
    expect(comparePassword).not.toHaveBeenCalled();
    expect(generateHashPassword).not.toHaveBeenCalled();

    Object.assign(user, newAttrs);

    expect(savedUser).toBeCalledWith(user);
    expect(updateProfile).toBe(user);
  });

  it('shoul not be able to update profile if user not exists.', async () => {
    const userId = 'uuid';

    const findById = jest
      .spyOn(repo, 'findById')
      .mockImplementation(async () => undefined);

    await expect(
      service.run({
        user_id: userId,
        name: 'newName',
      }),
    ).rejects.toEqual(new AppError('User not found.', 401));

    expect(findById).toBeCalledWith(userId);
  });

  it('should not be able to change to another user email.', async () => {
    const userId = 'uuid';
    const user = new User();
    user.id = userId;
    user.email = 'oldMail@email.com';
    user.name = 'oldName';

    const findById = jest
      .spyOn(repo, 'findById')
      .mockImplementation(async () => user);

    const checkEmail = jest
      .spyOn(repo, 'findByEmail')
      .mockImplementation(async () => {
        const existentUser = new User();
        existentUser.email = 'usedMail@email.com';
        return existentUser;
      });

    const generateHashPassword = jest.spyOn(hashProvider, 'generateHash');

    await expect(() =>
      service.run({
        user_id: user.id,
        email: 'usedMail@email.com',
        name: 'newName',
      }),
    ).rejects.toEqual(new AppError('E-mail already in use.'));

    expect(findById).toBeCalledWith(user.id);
    expect(checkEmail).toBeCalledWith('usedMail@email.com');
    expect(generateHashPassword).not.toBeCalled();
  });

  it('should not be able to update the password without old password.', async () => {
    const userId = 'uuid';
    const user = new User();
    user.id = userId;
    user.email = 'oldMail@email.com';
    user.name = 'oldName';
    user.password = 'oldPassword';

    const findById = jest
      .spyOn(repo, 'findById')
      .mockImplementation(async () => user);

    const checkEmail = jest.spyOn(repo, 'findByEmail');

    const generateHashPassword = jest.spyOn(hashProvider, 'generateHash');

    await expect(() =>
      service.run({
        user_id: user.id,
        name: 'newName',
        password: 'newPassword',
      }),
    ).rejects.toEqual(
      new AppError(
        'You need to inform the old password to set a new password.',
      ),
    );

    expect(findById).toBeCalledWith(user.id);
    expect(checkEmail).not.toBeCalled();
    expect(generateHashPassword).not.toBeCalled();
  });

  it('should not be able to update the password with wrong old password.', async () => {
    const userId = 'uuid';
    const user = new User();
    user.id = userId;
    user.email = 'oldMail@email.com';
    user.name = 'oldName';
    user.password = 'oldPassword';

    const findById = jest
      .spyOn(repo, 'findById')
      .mockImplementation(async () => user);

    const checkEmail = jest.spyOn(repo, 'findByEmail');

    const comparePassword = jest
      .spyOn(hashProvider, 'compareHash')
      .mockImplementation(async () => false);

    const generateHashPassword = jest.spyOn(hashProvider, 'generateHash');

    await expect(() =>
      service.run({
        user_id: user.id,
        name: 'newName',
        password: 'newPassword',
        old_password: 'wrong-oldPassword',
      }),
    ).rejects.toEqual(new AppError('Old password does not match.'));

    expect(findById).toBeCalledWith(user.id);
    expect(checkEmail).not.toBeCalled();
    expect(comparePassword).toHaveBeenCalledWith(
      'wrong-oldPassword',
      'oldPassword',
    );
    expect(generateHashPassword).not.toBeCalled();
  });
});
