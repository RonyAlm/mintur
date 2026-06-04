import { FindUserByEmailUseCase } from '../../../../modules/users/applications';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto';
export declare class LoginUseCase {
    private readonly findUserByEmail;
    private readonly jwtService;
    constructor(findUserByEmail: FindUserByEmailUseCase, jwtService: JwtService);
    execute(dto: LoginDto): Promise<{
        accessToken: string;
        email: string;
    }>;
}
