import IAppointmentsRepository from '../repositories/IAppointmentsRepository';
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import Appointment from '../infra/typeorm/entities/Appointment';
import ListProviderMonthAvailabillityService from './ListProviderMonthAvailabillityService';

describe('ListProviderMonthAvailabillityService', () => {
  let appointmentsRepo: IAppointmentsRepository;
  let service: ListProviderMonthAvailabillityService;

  beforeEach(() => {
    appointmentsRepo = new FakeAppointmentsRepository();
    service = new ListProviderMonthAvailabillityService(appointmentsRepo);
  });

  it('should be able to list the month availability from provider', async () => {
    const providerId = 'uuid';
    const findAvailabillity = jest
      .spyOn(appointmentsRepo, 'findAllInMonthFromProvider')
      .mockImplementation(async () => {
        const appointment8 = new Appointment();
        Object.assign(appointment8, {
          provider_id: providerId,
          date: new Date(2020, 4, 20, 8, 0, 0),
        });
        const appointment9 = new Appointment();
        Object.assign(appointment9, {
          provider_id: providerId,
          date: new Date(2020, 4, 20, 9, 0, 0),
        });
        const appointment10 = new Appointment();
        Object.assign(appointment10, {
          provider_id: providerId,
          date: new Date(2020, 4, 20, 10, 0, 0),
        });
        const appointment11 = new Appointment();
        Object.assign(appointment11, {
          provider_id: providerId,
          date: new Date(2020, 4, 20, 11, 0, 0),
        });
        const appointment12 = new Appointment();
        Object.assign(appointment12, {
          provider_id: providerId,
          date: new Date(2020, 4, 20, 12, 0, 0),
        });
        const appointment13 = new Appointment();
        Object.assign(appointment13, {
          provider_id: providerId,
          date: new Date(2020, 4, 20, 13, 0, 0),
        });
        const appointment14 = new Appointment();
        Object.assign(appointment14, {
          provider_id: providerId,
          date: new Date(2020, 4, 20, 14, 0, 0),
        });
        const appointment15 = new Appointment();
        Object.assign(appointment15, {
          provider_id: providerId,
          date: new Date(2020, 4, 20, 15, 0, 0),
        });
        const appointment16 = new Appointment();
        Object.assign(appointment16, {
          provider_id: providerId,
          date: new Date(2020, 4, 20, 16, 0, 0),
        });
        const appointment17 = new Appointment();
        Object.assign(appointment17, {
          provider_id: providerId,
          date: new Date(2020, 4, 20, 17, 0, 0),
        });
        const appointment18 = new Appointment();
        Object.assign(appointment18, {
          provider_id: providerId,
          date: new Date(2020, 4, 21, 16, 0, 0),
        });

        return [
          appointment8,
          appointment9,
          appointment10,
          appointment11,
          appointment12,
          appointment13,
          appointment14,
          appointment15,
          appointment16,
          appointment17,
          appointment18,
        ];
      });

    const availability = await service.run({
      provider_id: 'uuid',
      month: 5,
      year: 2020,
    });

    expect(availability).toEqual(
      expect.arrayContaining([
        {
          day: 19,
          available: true,
        },
        {
          day: 20,
          available: false,
        },
        {
          day: 21,
          available: true,
        },
      ]),
    );
    expect(findAvailabillity).toBeCalledWith({
      provider_id: 'uuid',
      month: 5,
      year: 2020,
    });
  });
});
