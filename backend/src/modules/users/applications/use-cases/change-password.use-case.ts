import bcrypt from 'bcryptjs';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '../../domain';
import { ChangePasswordDto } from '../dtos';

@Injectable()
export class ChangePasswordUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{
    isSuccess: boolean;
    message: string;
  }> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordCorrect = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isPasswordCorrect)
      throw new UnauthorizedException('Incorrect password');

    if (dto.newPassword !== dto.confirmPassword)
      throw new BadRequestException('Passwords do not match');

    const samePassword = await bcrypt.compare(
      dto.newPassword,
      user.passwordHash,
    );
    if (samePassword)
      throw new BadRequestException(
        'New password cannot be the same as the current password',
      );

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    const updatedPassword = await this.usersRepository.update(userId, {
      passwordHash: hashedPassword,
      mustChangePassword: false,
    });
    if (!updatedPassword)
      throw new ConflictException('Error updating password');

    return {
      isSuccess: true,
      message: 'Password changed successfully',
    };
  }
}
