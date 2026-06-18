import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
// import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './applications/dto';
/*
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register({ password, email, name }: RegisterDto) {
    const user = await this.usersService.findOneByEmail(email);
    if (user) throw new BadRequestException('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const userCreated = await this.usersService.create({
      password: hashedPassword,
      email,
      name,
    });
    return userCreated;
  }

  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const payload = { email, role: user.role };

    const token = await this.jwtService.signAsync(payload);

    return {
      accessToken: token,
      email: user.email,
    };
  }

  async profile(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    return user;
  }
}

*/
