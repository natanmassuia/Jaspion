import { FastifyInstance } from 'fastify';
import { CemService } from './cem.service.js';

export async function cemRoutes(app: FastifyInstance) {
  const service = new CemService();
  await service.ensureDraftStorage();

  app.get('/api/checklist-cem/blocks', async () => {
    const blocks = await service.listBlocksWithQuestions();
    return { success: true, data: blocks };
  });

  app.get('/api/checklist-cem/evaluations', async () => {
    const evaluations = await service.listEvaluations();
    return { success: true, data: evaluations };
  });

  app.get('/api/checklist-cem/draft', async () => {
    return { success: true, data: await service.getDraft() };
  });

  app.put('/api/checklist-cem/draft', async (request: any) => {
    return { success: true, data: await service.saveDraft(request.body) };
  });

  app.delete('/api/checklist-cem/draft', async () => {
    await service.clearDraft();
    return { success: true };
  });

  app.get('/api/checklist-cem/evaluations/:id', async (request: any, reply) => {
    const evaluation = await service.getEvaluation(request.params.id);
    if (!evaluation) return reply.status(404).send({ success: false, message: 'Avaliação não encontrada.' });
    return { success: true, data: evaluation };
  });

  app.post('/api/checklist-cem/evaluations', async (request: any, reply) => {
    const result = await service.saveEvaluation(request.body);
    return reply.status(201).send({ success: true, data: result });
  });

  app.put('/api/checklist-cem/evaluations/:id', async (request: any, reply) => {
    const result = await service.updateEvaluation(request.params.id, request.body);
    if (!result) return reply.status(404).send({ success: false, message: 'Avaliação não encontrada.' });
    return { success: true, data: result };
  });
}
