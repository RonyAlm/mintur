import { Users, UsersRepository } from '../../domain';
export declare class FindUserByEmailUseCase {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    execute(email: string): Promise<Users | null>;
}
