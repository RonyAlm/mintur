"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = exports.Role = void 0;
var Role;
(function (Role) {
    Role["USER"] = "user";
    Role["ADMIN"] = "admin";
    Role["SUPERADMIN"] = "superadmin";
})(Role || (exports.Role = Role = {}));
class Users {
    id;
    name;
    email;
    password;
    role;
    createdAt;
    updatedAt;
    constructor(id, name, email, password, role, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Users = Users;
//# sourceMappingURL=users.entity.js.map