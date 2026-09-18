import 'dotenv/config';

export const jwtConstants = {
  secret: process.env.JWT_SECRET as string,
  expiresIn: '1d' as const,
};
