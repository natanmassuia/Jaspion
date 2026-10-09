import { FastifyInstance } from 'fastify';
import { ClientesService } from './clientes.service.js';
import fs from 'fs';
import path from 'path';

function saveBase64Image(base64Str: string, prefix: string, id: string): string {
  let mimeMatch = base64Str.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
  let ext = 'jpg';
  let rawBase64 = base64Str;
  
  if (mimeMatch) {
    ext = mimeMatch[1] === 'jpeg' ? 'jpg' : mimeMatch[1];
    rawBase64 = base64Str.substring(mimeMatch[0].length);
  }
  
  const buffer = Buffer.from(rawBase64, 'base64');
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${prefix}_${safeId}_${Date.now()}.${ext}`;
  
  const targetDirs = [
    path.resolve(process.cwd(), 'data', 'uploads'),
    path.resolve(process.cwd(), '..', 'data', 'uploads'),
    'C:\\Apps\\Jaspion\\data\\uploads',
    path.resolve(process.cwd(), 'frontend', 'dist', 'uploads'),
    path.resolve(process.cwd(), '..', 'frontend', 'dist', 'uploads'),
    'C:\\Apps\\Jaspion\\frontend\\dist\\uploads',
    path.resolve(process.cwd(), 'frontend', 'public', 'uploads'),
    path.resolve(process.cwd(), '..', 'frontend', 'public', 'uploads'),
    'C:\\Apps\\Jaspion\\frontend\\public\\uploads'
  ];

  let savedAny = false;
  for (const dir of targetDirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(path.join(dir, fileName), buffer);
      savedAny = true;
    } catch {
      // Continue trying other targets
    }
  }

  if (!savedAny) {
    throw new Error('Falha ao salvar arquivo no disco do servidor');
  }

  return `/uploads/${fileName}`;
}

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

  app.post('/api/clientes', async (request: any, reply) => {
    const body = request.body || {};
    if (!body.name || !body.name.trim()) {
      return reply.status(400).send({
        success: false,
        error: { message: 'O nome do cliente é obrigatório' }
      });
    }

    try {
      const client = await service.createClient(body);
      return reply.status(201).send({ success: true, data: client });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        error: { message: err.message || 'Erro ao cadastrar cliente' }
      });
    }
  });

  app.put('/api/clientes/:id', async (request: any, reply) => {
    const { id } = request.params;
    const body = request.body || {};

    try {
      const updated = await service.updateClient(id, body);
      return { success: true, data: updated };
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        error: { message: err.message || 'Erro ao atualizar cliente' }
      });
    }
  });

  app.post('/api/clientes/:id/image', async (request: any, reply) => {
    const { id } = request.params;
    const { imageUrl, imageBase64 } = request.body || {};

    let finalImageUrl = imageUrl;

    if (imageBase64) {
      try {
        finalImageUrl = saveBase64Image(imageBase64, 'client', id);
      } catch (err: any) {
        return reply.status(500).send({ success: false, error: { message: err.message } });
      }
    }

    if (!finalImageUrl) {
      return reply.status(400).send({ success: false, error: { message: 'Nenhuma imagem ou URL fornecida' } });
    }

    await service.updateClientImage(id, finalImageUrl);
    return { success: true, imageUrl: finalImageUrl };
  });
}
