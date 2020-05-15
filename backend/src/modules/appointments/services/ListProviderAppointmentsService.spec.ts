import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import IAppointmentsRepository from '../repositories/IAppointmentsRepository';
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import Appointment from '../infra/typeorm/entities/Appointment';
import ListProviderAppointmentsService from './ListProviderAppointmentsService';

describe('ListProviderAppointmentsService', () => {
  let appointmentsRepo: IAppointmentsRepository;
  let cacheProvider: ICacheProvider;
  let service: ListProviderAppointmentsService;

  beforeEach(() => {
    appointmentsRepo = new FakeAppointmentsRepository();
    cacheProvider = new FakeCacheProvider();
    service = new ListProviderAppointmentsService(
      appointmentsRepo,
      cacheProvider,
    );
  });

  it('should be able to list the appointments on a specific day.', async () => {
    const providerId = 'uuid';

    const appointment1 = new Appointment();
    Object.assign(appointment1, {
      provider_id: providerId,
      date: new Date(2020, 4, 20, 14, 0, 0),
    });
    const appointment2 = new Appointment();
    Object.assign(appointment2, {
      provider_id: providerId,
      date: new Date(2020, 4, 20, 15, 0, 0),
    });

    const appointments = [appointment1, appointment2];

    const findAvailability = jest
      .spyOn(appointmentsRepo, 'findAllInDayFromProvider')
      .mockImplementation(async () => appointments);

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 20, 11).getTime();
    });

    const availability = await service.run({
      provider_id: 'uuid',
      month: 5,
      year: 2020,
      day: 20,
    });

    expect(availability).toEqual(appointments);
    expect(findAvailability).toBeCalledWith({
      provider_id: 'uuid',
      month: 5,
      year: 2020,
      day: 20,
    });
  });
});
