import { PrismaClient } from '@prisma/client';

import fastifyPlugin from 'fastify-plugin';

export default fastifyPlugin(async function (fastify) {
  const db = new PrismaClient();

  await db.$connect().catch((error) => {
    fastify.log.error(`[ plugin ] Couldn't connect to DB \n${error}`);
    process.exit(1);
  });

  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    await db.$disconnect();
  });

  fastify.log.info(`[ plugin ] DBConnection plugin loaded.`);
});
