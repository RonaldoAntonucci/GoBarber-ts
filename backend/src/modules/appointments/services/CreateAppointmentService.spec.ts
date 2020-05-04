import { uuid } from 'uuidv4';

import AppError from '@shared/errors/AppError';
import Appointment from '@modules/appointments/infra/typeorm/entities/Appointment';

import FakeAppointmentsRepository from '@modules/appointments/repositories/fakes/FakeAppointmentsRepository';
import CreateAppointmentService from '@modules/appointments/services/CreateAppointmentService';

describe('Create Appointment', () => {
  let service: CreateAppointmentService;
  let repo: FakeAppointmentsRepository;

  beforeEach(() => {
    repo = new FakeAppointmentsRepository();
    service = new CreateAppointmentService(repo);
  });

  it('should be able to create a new appointment.', async () => {
    const provider_id = uuid();

    const appointment = await service.run({
      date: new Date(),
      provider_id,
    });

    expect(appointment).toBeInstanceOf(Appointment);
    expect(appointment).toHaveProperty('id');
    expect(appointment).toHaveProperty('provider_id', provider_id);
  });

  it('should not be able to create two appointments on the same time.', async () => {
    const provider_id = uuid();

    jest
      .spyOn(repo, 'findByDate')
      .mockImplementation(async () => new Appointment());

    expect(
      service.run({
        date: new Date(),
        provider_id,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
