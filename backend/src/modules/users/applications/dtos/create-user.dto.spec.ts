import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe.only('CreateUserDto', () => {
  it('should be defined', () => {
    expect(true).toBeTruthy();
  });

  it('should validate with valid data', async () => {
    const dto = new CreateUserDto();

    dto.name = 'Test';
    dto.email = 'test@me.com';
    dto.password = 'password';

    const errors = await validate(dto);
    expect(dto).toBeDefined();
    expect(errors.length).toBe(0);
  });

  it('should not validate with invalid email', async () => {
    const dto = new CreateUserDto();

    dto.name = 'Test';
    dto.email = 'testme.com';
    dto.password = 'password';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
    errors.forEach((error) => {
      if (error.property === 'email') {
        expect(error.constraints?.isEmail).toBeDefined();
      } else {
        expect(true).toBeFalsy();
      }
    });
  });

  it('should be invalid if name is not present', async () => {
    const dto = new CreateUserDto();

    dto.email = 'test@me.com';
    dto.password = 'pass';

    const errors = await validate(dto);
    const nameError = errors.find((error) => error.property === 'name');
    expect(nameError).toBeDefined();
    expect(nameError?.constraints?.isNotEmpty).toBeDefined();
  });
});
