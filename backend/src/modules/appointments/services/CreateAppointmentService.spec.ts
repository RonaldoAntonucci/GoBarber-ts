import { uuid } from 'uuidv4';

import AppError from '@shared/errors/AppError';
import Appointment from '@modules/appointments/infra/typeorm/entities/Appointment';

import FakeAppointmentsRepository from '@modules/appointments/repositories/fakes/FakeAppointmentsRepository';
import INotificationsRepository from '@modules/notifications/repositories/INotificationsRepository';
import FakeNotificationsRepository from '@modules/notifications/repositories/fakes/FakeNotificationsRepository';
import CreateAppointmentService from '@modules/appointments/services/CreateAppointmentService';
import IAppointmentsRepository from '../repositories/IAppointmentsRepository';

describe('Create Appointment', () => {
  let service: CreateAppointmentService;
  let repo: IAppointmentsRepository;
  let notificationsRepo: INotificationsRepository;

  beforeEach(() => {
    repo = new FakeAppointmentsRepository();
    notificationsRepo = new FakeNotificationsRepository();
    service = new CreateAppointmentService(repo, notificationsRepo);
  });

  it('should be able to create a new appointment.', async () => {
    const provider_id = uuid();
    const user_id = uuid();

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });

    const createNotification = jest.spyOn(notificationsRepo, 'create');

    const appointment = await service.run({
      date: new Date(2020, 4, 10, 13),
      provider_id,
      user_id,
    });

    expect(appointment).toBeInstanceOf(Appointment);
    expect(appointment).toHaveProperty('id');
    expect(appointment).toHaveProperty('provider_id', provider_id);
    expect(appointment).toHaveProperty('user_id', user_id);
    expect(createNotification).toBeCalled();
  });

  it('should not be able to create two appointments on the same time.', async () => {
    const provider_id = uuid();
    const user_id = uuid();

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });

    jest
      .spyOn(repo, 'findByDate')
      .mockImplementation(async () => new Appointment());

    await expect(
      service.run({
        date: new Date(2020, 4, 10, 12),
        provider_id,
        user_id,
      }),
    ).rejects.toEqual(new AppError('This appointment is already booked.'));
  });

  it('should not be able to create an appointment on a past date', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });

    await expect(() =>
      service.run({
        date: new Date(2020, 4, 10, 11),
        provider_id: '1234',
        user_id: '4321',
      }),
    ).rejects.toEqual(
      new AppError("You can't create an appointment on a past date."),
    );
  });

  it('should not be able to create an appointment with same user as provider.', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });

    await expect(() =>
      service.run({
        date: new Date(2020, 4, 10, 13),
        provider_id: '1234',
        user_id: '1234',
      }),
    ).rejects.toEqual(
      new AppError("You can't create an appointment with yourself."),
    );
  });

  it('should not be able to create an appointment before 8am.', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });

    await expect(() =>
      service.run({
        date: new Date(2020, 4, 11, 7),
        provider_id: '1234',
        user_id: '4321',
      }),
    ).rejects.toEqual(
      new AppError('You can only create appointments between 8am and 5pm.'),
    );
  });

  it('should not be able to create an appointment after 5pm.', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });

    await expect(() =>
      service.run({
        date: new Date(2020, 4, 11, 18),
        provider_id: '1234',
        user_id: '4321',
      }),
    ).rejects.toEqual(
      new AppError('You can only create appointments between 8am and 5pm.'),
    );
  });
});
