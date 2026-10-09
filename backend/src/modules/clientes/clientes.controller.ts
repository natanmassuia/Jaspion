import { FastifyInstance } from 'fastify';
import { ClientesService } from './clientes.service.js';

export async function clientesRoutes(app: FastifyInstance) {
  const service = new ClientesService();

  app.get('/api/clientes', async (request, reply) => {
    const clients = await service.listClients();
    return { success: true, data: clients };
  });

  app.get('/api/clientes/:id', async (request: any, reply) => {
    const client = await service.getClientById(request.params.id);
    if (!client) {
      return reply.status(404).send({ success: false, error: { message: 'Cliente não encontrado' } });
    }
    return { success: true, data: client };
  });
}
