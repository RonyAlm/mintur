import { Role } from '../../../modules/users/domain/entities';
export declare function Auth(role: Role): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
