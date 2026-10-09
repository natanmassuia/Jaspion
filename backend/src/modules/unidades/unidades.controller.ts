import { FastifyInstance } from 'fastify';
import { UnidadesService } from './unidades.service.js';
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

export async function unidadesRoutes(app: FastifyInstance) {
  const service = new UnidadesService();

  app.get('/api/unidades', async (request: any, reply) => {
    const { clientId } = request.query || {};
    const units = await service.listUnits(clientId);
    return { success: true, data: units };
  });

  app.get('/api/unidades/:id', async (request: any, reply) => {
    const unit = await service.getUnitDetails(request.params.id);
    if (!unit) {
      return reply.status(404).send({ success: false, error: { message: 'Unidade não encontrada' } });
    }
    return { success: true, data: unit };
  });

  app.post('/api/unidades', async (request: any, reply) => {
    const body = request.body || {};
    if (!body.name || !body.name.trim() || !body.clientId || !body.clientId.trim()) {
      return reply.status(400).send({
        success: false,
        error: { message: 'O nome da unidade e o cliente vinculado são obrigatórios' }
      });
    }

    try {
      const unit = await service.createUnit(body);
      return reply.status(201).send({ success: true, data: unit });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        error: { message: err.message || 'Erro ao cadastrar unidade' }
      });
    }
  });

  app.put('/api/unidades/:id', async (request: any, reply) => {
    const { id } = request.params;
    const body = request.body || {};

    try {
      const updated = await service.updateUnit(id, body);
      return { success: true, data: updated };
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        error: { message: err.message || 'Erro ao atualizar unidade' }
      });
    }
  });

  app.post('/api/unidades/:id/image', async (request: any, reply) => {
    const { id } = request.params;
    const { imageUrl, imageBase64 } = request.body || {};

    let finalImageUrl = imageUrl;

    if (imageBase64) {
      try {
        finalImageUrl = saveBase64Image(imageBase64, 'unit', id);
      } catch (err: any) {
        return reply.status(500).send({ success: false, error: { message: err.message } });
      }
    }

    if (!finalImageUrl) {
      return reply.status(400).send({ success: false, error: { message: 'Nenhuma imagem ou URL fornecida' } });
    }

    await service.updateUnitImage(id, finalImageUrl);
    return { success: true, imageUrl: finalImageUrl };
  });
}
