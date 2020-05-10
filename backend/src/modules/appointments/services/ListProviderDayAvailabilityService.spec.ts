import IAppointmentsRepository from '../repositories/IAppointmentsRepository';
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import Appointment from '../infra/typeorm/entities/Appointment';
import ListProviderDayAvailabilityService from './ListProviderDayAvailabilityService';

describe('ListProviderDayAvailabilityService', () => {
  let appointmentsRepo: IAppointmentsRepository;
  let service: ListProviderDayAvailabilityService;

  beforeEach(() => {
    appointmentsRepo = new FakeAppointmentsRepository();
    service = new ListProviderDayAvailabilityService(appointmentsRepo);
  });

  it('should be able to list the day availability from provider', async () => {
    const providerId = 'uuid';

    const findAvailability = jest
      .spyOn(appointmentsRepo, 'findAllInDayFromProvider')
      .mockImplementation(async () => {
        const appointment8 = new Appointment();
        Object.assign(appointment8, {
          provider_id: providerId,
          date: new Date(2020, 4, 20, 8, 0, 0),
        });
        const appointment10 = new Appointment();
        Object.assign(appointment10, {
          provider_id: providerId,
          date: new Date(2020, 4, 20, 10, 0, 0),
        });

        return [appointment8, appointment10];
      });

    const availability = await service.run({
      provider_id: 'uuid',
      month: 5,
      year: 2020,
      day: 20,
    });

    expect(availability).toEqual(
      expect.arrayContaining([
        {
          hour: 8,
          available: false,
        },
        {
          hour: 9,
          available: true,
        },
        {
          hour: 10,
          available: false,
        },
      ]),
    );
    expect(findAvailability).toBeCalledWith({
      provider_id: 'uuid',
      month: 5,
      year: 2020,
      day: 20,
    });
  });
});
