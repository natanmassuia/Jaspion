import { sqliteClient } from '../../database/connection.js';

export class UnidadesService {
  async getUnitDetails(unitId: string) {
    const unitRes = await sqliteClient.execute({
      sql: `
        SELECT u.*, c.name as client_name, c.is_vip as client_is_vip, c.gn_name
        FROM units u
        JOIN clients c ON c.id = u.client_id
        WHERE u.id = ?
      `,
      args: [unitId]
    });
    if (unitRes.rows.length === 0) return null;
    const unit = unitRes.rows[0];

    const circuitsRes = await sqliteClient.execute({
      sql: 'SELECT * FROM circuits WHERE unit_id = ? ORDER BY is_primary DESC, speed_mbps DESC',
      args: [unitId]
    });

    const contactsRes = await sqliteClient.execute({
      sql: `
        SELECT ct.*, uc.priority_order
        FROM contacts ct
        JOIN unit_contacts uc ON uc.contact_id = ct.id
        WHERE uc.unit_id = ?
        ORDER BY uc.priority_order ASC
      `,
      args: [unitId]
    });

    // Se a unidade não tiver contatos específicos, traz os contatos padrão do Grupo Balbo
    let contactsList = contactsRes.rows;
    if (contactsList.length === 0) {
      const defaultContacts = await sqliteClient.execute('SELECT * FROM contacts ORDER BY id ASC');
      contactsList = defaultContacts.rows;
    }

    const proceduresRes = await sqliteClient.execute({
      sql: 'SELECT * FROM procedures WHERE unit_id = ? OR client_id = ?',
      args: [unitId, unit.client_id]
    });

    return {
      id: unit.id,
      name: unit.name,
      clientId: unit.client_id,
      clientName: unit.client_name,
      clientIsVip: Boolean(unit.client_is_vip),
      gnName: unit.gn_name,
      intraCode: unit.intra_code,
      sankhyaCode: unit.sankhya_code,
      city: unit.city,
      state: unit.state,
      address: unit.address,
      businessHours: unit.business_hours,
      phone: unit.phone,
      environment: unit.environment,
      dependencies: unit.dependencies,
      isActive: Boolean(unit.is_active),
      circuits: circuitsRes.rows.map(c => ({
        id: c.id,
        operator: c.operator,
        technology: c.technology,
        speedMbps: c.speed_mbps,
        circuitId: c.circuit_id,
        contractId: c.contract_id,
        lpIp: c.lp_ip,
        lpVpn: c.lp_vpn,
        isPrimary: Boolean(c.is_primary),
        notes: c.notes
      })),
      contacts: contactsList.map(ct => ({
        id: ct.id,
        name: ct.name,
        roleDescription: ct.role_description,
        phone: ct.phone,
        mobile: ct.mobile,
        whatsapp: ct.whatsapp,
        schedule: ct.schedule
      })),
      procedures: proceduresRes.rows.map(p => ({
        id: p.id,
        category: p.category,
        content: p.content,
        version: p.version
      }))
    };
  }
}
