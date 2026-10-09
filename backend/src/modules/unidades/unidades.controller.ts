import { FastifyInstance } from 'fastify';
import { UnidadesService } from './unidades.service.js';

export async function unidadesRoutes(app: FastifyInstance) {
  const service = new UnidadesService();

  app.get('/api/unidades/:id', async (request: any, reply) => {
    const unit = await service.getUnitDetails(request.params.id);
    if (!unit) {
      return reply.status(404).send({ success: false, error: { message: 'Unidade não encontrada' } });
    }
    return { success: true, data: unit };
  });
}
