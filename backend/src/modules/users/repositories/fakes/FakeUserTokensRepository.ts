import UserToken from '@modules/users/infra/typeorm/entities/UserToken';
import { uuid } from 'uuidv4';
import IUserTokensRepository from '../IUserTokensRepository';

export default class FakeUserTokensRepository implements IUserTokensRepository {
  public async generate(user_id: string): Promise<UserToken> {
    const token = new UserToken();
    token.user_id = user_id;
    token.id = uuid();
    token.token = uuid();
    return token;
  }

  public async findByToken(): Promise<UserToken | undefined> {
    return undefined;
  }
}
