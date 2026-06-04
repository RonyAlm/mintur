import { Request } from 'express';
import { LoginDto, LoginUseCase } from '../../applications';
export interface RequestWithUser extends Request {
    user: {
        email: string;
        role?: string;
    };
}
export declare class AuthController {
    private readonly loginUseCase;
    constructor(loginUseCase: LoginUseCase);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        email: string;
    }>;
}
