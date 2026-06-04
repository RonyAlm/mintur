"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
const entities_1 = require("../../domain/entities/");
class UserMapper {
    static toDomain(raw) {
        return new entities_1.Users(raw.id, raw.name, raw.email, raw.password, raw.role, raw.createdAt, raw.updatedAt);
    }
    static toDomainList(raw) {
        return raw.map((user) => this.toDomain(user));
    }
}
exports.UserMapper = UserMapper;
//# sourceMappingURL=user.mapper.js.map