import { FastifyInstance } from 'fastify';
import { CemService } from './cem.service.js';

export async function cemRoutes(app: FastifyInstance) {
  const service = new CemService();

  app.get('/api/checklist-cem/blocks', async () => {
    const blocks = await service.listBlocksWithQuestions();
    return { success: true, data: blocks };
  });

  app.get('/api/checklist-cem/evaluations', async () => {
    const evaluations = await service.listEvaluations();
    return { success: true, data: evaluations };
  });

  app.post('/api/checklist-cem/evaluations', async (request: any, reply) => {
    const result = await service.saveEvaluation(request.body);
    return reply.status(201).send({ success: true, data: result });
  });
}
