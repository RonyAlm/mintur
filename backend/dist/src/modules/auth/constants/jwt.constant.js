"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConstants = void 0;
require("dotenv/config");
exports.jwtConstants = {
    secret: process.env.JWT_SECRET,
    expiresIn: '1d',
};
//# sourceMappingURL=jwt.constant.js.map