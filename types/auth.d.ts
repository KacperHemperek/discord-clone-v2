import { RegisterUserBody } from '@api/app/routes/auth/auth.schema';
import { Static } from '@sinclair/typebox';

export type RegisterUserBodyType = Static<typeof RegisterUserBody>;
