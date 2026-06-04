"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../modules/prisma/prisma.module");
const applications_1 = require("../applications");
const persistence_1 = require("./persistence");
const domain_1 = require("../domain");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        exports: [applications_1.FindUserByEmailUseCase],
        providers: [
            applications_1.FindUserByEmailUseCase,
            {
                provide: domain_1.UsersRepository,
                useClass: persistence_1.PrismaUsersRepository,
            },
        ],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map