import { sqliteClient } from '../../database/connection.js';

export interface CreateClientInput {
  id?: string;
  name: string;
  isVip?: boolean;
  economicGroup?: string | null;
  managerName?: string | null;
  gnName?: string | null;
  sankhyaCode?: string | null;
  description?: string | null;
  imageUrl?: string | null;
}

export interface UpdateClientInput {
  name?: string;
  isVip?: boolean;
  economicGroup?: string | null;
  managerName?: string | null;
  gnName?: string | null;
  sankhyaCode?: string | null;
  description?: string | null;
  imageUrl?: string | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export class ClientesService {
  async listClients() {
    const clientsResult = await sqliteClient.execute(`
      SELECT c.*, COUNT(u.id) as units_count
      FROM clients c
      LEFT JOIN units u ON u.client_id = c.id
      GROUP BY c.id
      ORDER BY c.is_vip DESC, c.name ASC
    `);
    return clientsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      isVip: Boolean(row.is_vip),
      economicGroup: row.economic_group,
      managerName: row.manager_name,
      gnName: row.gn_name,
      sankhyaCode: row.sankhya_code,
      description: row.description,
      imageUrl: (row as any).image_url || null,
      unitsCount: Number(row.units_count)
    }));
  }

  async getClientById(id: string) {
    const clientResult = await sqliteClient.execute({
      sql: 'SELECT * FROM clients WHERE id = ?',
      args: [id]
    });
    if (clientResult.rows.length === 0) return null;
    const client = clientResult.rows[0];

    const unitsResult = await sqliteClient.execute({
      sql: 'SELECT * FROM units WHERE client_id = ? ORDER BY is_active DESC, name ASC',
      args: [id]
    });

    const proceduresResult = await sqliteClient.execute({
      sql: 'SELECT * FROM procedures WHERE client_id = ?',
      args: [id]
    });

    return {
      id: client.id,
      name: client.name,
      isVip: Boolean(client.is_vip),
      economicGroup: client.economic_group,
      managerName: client.manager_name,
      gnName: client.gn_name,
      sankhyaCode: client.sankhya_code,
      description: client.description,
      imageUrl: (client as any).image_url || null,
      units: unitsResult.rows.map(u => ({
        id: u.id,
        name: u.name,
        intraCode: u.intra_code,
        sankhyaCode: u.sankhya_code,
        city: u.city,
        state: u.state,
        address: u.address,
        isActive: Boolean(u.is_active),
        imageUrl: (u as any).image_url || null
      })),
      procedures: proceduresResult.rows.map(p => ({
        id: p.id,
        category: p.category,
        content: p.content,
        version: p.version
      }))
    };
  }

  async createClient(data: CreateClientInput) {
    let clientId = data.id ? slugify(data.id) : slugify(data.name);
    if (!clientId) clientId = `cliente-${Date.now()}`;

    // Check if ID already exists
    const existing = await sqliteClient.execute({
      sql: 'SELECT id FROM clients WHERE id = ?',
      args: [clientId]
    });

    if (existing.rows.length > 0) {
      clientId = `${clientId}-${Date.now().toString(36)}`;
    }

    const now = new Date().toISOString();

    await sqliteClient.execute({
      sql: `
        INSERT INTO clients (
          id, name, is_vip, economic_group, manager_name,
          gn_name, sankhya_code, description, image_url,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        clientId,
        data.name.trim(),
        data.isVip ? 1 : 0,
        data.economicGroup?.trim() || null,
        data.managerName?.trim() || null,
        data.gnName?.trim() || null,
        data.sankhyaCode?.trim() || null,
        data.description?.trim() || null,
        data.imageUrl?.trim() || null,
        now,
        now
      ]
    });

    return this.getClientById(clientId);
  }

  async updateClient(id: string, data: UpdateClientInput) {
    const now = new Date().toISOString();
    await sqliteClient.execute({
      sql: `
        UPDATE clients SET
          name = COALESCE(?, name),
          is_vip = COALESCE(?, is_vip),
          economic_group = COALESCE(?, economic_group),
          manager_name = COALESCE(?, manager_name),
          gn_name = COALESCE(?, gn_name),
          sankhya_code = COALESCE(?, sankhya_code),
          description = COALESCE(?, description),
          image_url = COALESCE(?, image_url),
          updated_at = ?
        WHERE id = ?
      `,
      args: [
        data.name?.trim() ?? null,
        data.isVip !== undefined ? (data.isVip ? 1 : 0) : null,
        data.economicGroup?.trim() ?? null,
        data.managerName?.trim() ?? null,
        data.gnName?.trim() ?? null,
        data.sankhyaCode?.trim() ?? null,
        data.description?.trim() ?? null,
        data.imageUrl?.trim() ?? null,
        now,
        id
      ]
    });

    return this.getClientById(id);
  }

  async updateClientImage(clientId: string, imageUrl: string) {
    const now = new Date().toISOString();
    await sqliteClient.execute({
      sql: 'UPDATE clients SET image_url = ?, updated_at = ? WHERE id = ?',
      args: [imageUrl, now, clientId]
    });
    return { success: true, clientId, imageUrl };
  }
}
