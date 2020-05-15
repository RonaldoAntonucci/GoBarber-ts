import IUsersRepository from '@modules/users/repositories/IUserRepository';
import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import User from '@modules/users/infra/typeorm/entities/User';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import ListProvidersService from './ListProvidersService';

describe('ListProvidersService', () => {
  let repo: IUsersRepository;
  let cacheProvider: ICacheProvider;
  let service: ListProvidersService;

  beforeEach(() => {
    repo = new FakeUsersRepository();
    cacheProvider = new FakeCacheProvider();
    service = new ListProvidersService(repo, cacheProvider);
  });

  it('should be able to list the providers', async () => {
    const userId = 'uuid';

    const findProviders = jest
      .spyOn(repo, 'findAllProviders')
      .mockImplementation(async () => {
        const users: User[] = [new User()];
        return users;
      });

    const providers = await service.run({ user_id: userId });

    expect(providers).toBeInstanceOf(Array);
    providers.forEach(user => {
      expect(user).toBeInstanceOf(User);
    });
    expect(findProviders).toBeCalledWith({ except_user_id: userId });
  });
});
