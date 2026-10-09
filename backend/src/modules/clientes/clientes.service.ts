import { sqliteClient } from '../../database/connection.js';

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
      units: unitsResult.rows.map(u => ({
        id: u.id,
        name: u.name,
        intraCode: u.intra_code,
        sankhyaCode: u.sankhya_code,
        city: u.city,
        state: u.state,
        address: u.address,
        isActive: Boolean(u.is_active)
      })),
      procedures: proceduresResult.rows.map(p => ({
        id: p.id,
        category: p.category,
        content: p.content,
        version: p.version
      }))
    };
  }
}
