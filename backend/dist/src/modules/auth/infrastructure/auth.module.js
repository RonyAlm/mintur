"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
require("dotenv/config");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
const users_module_1 = require("../../../modules/users/infrastructure/users.module");
const auth_controller_1 = require("./controllers/auth.controller");
const applications_1 = require("../applications");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            jwt_1.JwtModule.register({
                global: true,
                secret: constants_1.jwtConstants.secret,
                signOptions: { expiresIn: constants_1.jwtConstants.expiresIn },
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [applications_1.LoginUseCase, jwt_1.JwtModule],
        exports: [jwt_1.JwtModule, applications_1.LoginUseCase],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map