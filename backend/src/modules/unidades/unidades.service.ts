import { sqliteClient } from '../../database/connection.js';

export interface CreateUnitInput {
  id?: string;
  clientId: string;
  name: string;
  intraCode?: string | null;
  sankhyaCode?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  businessHours?: string | null;
  phone?: string | null;
  environment?: string | null;
  dependencies?: string | null;
  isActive?: boolean;
  imageUrl?: string | null;
  circuit?: {
    operator: string;
    technology?: string;
    speedMbps?: number;
    circuitId?: string;
    contractId?: string;
    lpIp?: string;
    lpVpn?: string;
    isPrimary?: boolean;
    notes?: string;
  };
  contact?: {
    name: string;
    roleDescription?: string;
    phone?: string;
    mobile?: string;
    whatsapp?: string;
    schedule?: string;
  };
}

export interface UpdateUnitInput {
  name?: string;
  intraCode?: string | null;
  sankhyaCode?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  businessHours?: string | null;
  phone?: string | null;
  environment?: string | null;
  dependencies?: string | null;
  isActive?: boolean;
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

export class UnidadesService {
  async listUnits(clientId?: string) {
    let sql = `
      SELECT u.*, c.name as client_name, c.is_vip as client_is_vip, c.gn_name
      FROM units u
      JOIN clients c ON c.id = u.client_id
    `;
    const args: any[] = [];
    if (clientId) {
      sql += ' WHERE u.client_id = ?';
      args.push(clientId);
    }
    sql += ' ORDER BY u.is_active DESC, u.name ASC';

    const res = await sqliteClient.execute({ sql, args });
    return res.rows.map(u => ({
      id: u.id,
      name: u.name,
      clientId: u.client_id,
      clientName: u.client_name,
      clientIsVip: Boolean(u.client_is_vip),
      gnName: u.gn_name,
      intraCode: u.intra_code,
      sankhyaCode: u.sankhya_code,
      city: u.city,
      state: u.state,
      address: u.address,
      businessHours: u.business_hours,
      phone: u.phone,
      environment: u.environment,
      dependencies: u.dependencies,
      isActive: Boolean(u.is_active),
      imageUrl: (u as any).image_url || null
    }));
  }

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
      imageUrl: unit.image_url || null,
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

  async createUnit(data: CreateUnitInput) {
    let unitId = data.id ? slugify(data.id) : '';
    if (!unitId) {
      const prefix = data.clientId ? `${data.clientId}-` : '';
      unitId = `${prefix}${slugify(data.name)}`;
    }
    if (!unitId) unitId = `unidade-${Date.now()}`;

    // Check collision
    const existing = await sqliteClient.execute({
      sql: 'SELECT id FROM units WHERE id = ?',
      args: [unitId]
    });
    if (existing.rows.length > 0) {
      unitId = `${unitId}-${Date.now().toString(36)}`;
    }

    const now = new Date().toISOString();

    await sqliteClient.execute({
      sql: `
        INSERT INTO units (
          id, client_id, name, intra_code, sankhya_code,
          city, state, address, business_hours, phone,
          environment, dependencies, is_active, image_url,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        unitId,
        data.clientId,
        data.name.trim(),
        data.intraCode?.trim() || null,
        data.sankhyaCode?.trim() || null,
        data.city?.trim() || null,
        data.state?.trim() || null,
        data.address?.trim() || null,
        data.businessHours?.trim() || null,
        data.phone?.trim() || null,
        data.environment?.trim() || 'Produção',
        data.dependencies?.trim() || null,
        data.isActive === false ? 0 : 1,
        data.imageUrl?.trim() || null,
        now,
        now
      ]
    });

    // Circuit opcional
    if (data.circuit && data.circuit.operator && data.circuit.operator.trim()) {
      const circuitId = `${unitId}-c1-${Date.now().toString(36)}`;
      await sqliteClient.execute({
        sql: `
          INSERT INTO circuits (
            id, unit_id, operator, technology, speed_mbps,
            circuit_id, contract_id, lp_ip, lp_vpn, is_primary,
            notes, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          circuitId,
          unitId,
          data.circuit.operator.trim(),
          data.circuit.technology?.trim() || 'Fibra',
          data.circuit.speedMbps || null,
          data.circuit.circuitId?.trim() || null,
          data.circuit.contractId?.trim() || null,
          data.circuit.lpIp?.trim() || null,
          data.circuit.lpVpn?.trim() || null,
          data.circuit.isPrimary === false ? 0 : 1,
          data.circuit.notes?.trim() || null,
          now
        ]
      });
    }

    // Contact opcional
    if (data.contact && data.contact.name && data.contact.name.trim()) {
      const contactId = `ct_${slugify(data.contact.name)}_${Date.now().toString(36)}`;
      await sqliteClient.execute({
        sql: `
          INSERT INTO contacts (
            id, name, role_description, phone, mobile,
            whatsapp, schedule, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          contactId,
          data.contact.name.trim(),
          data.contact.roleDescription?.trim() || 'Responsável Operacional',
          data.contact.phone?.trim() || null,
          data.contact.mobile?.trim() || null,
          data.contact.whatsapp?.trim() || null,
          data.contact.schedule?.trim() || 'Comercial',
          now
        ]
      });

      await sqliteClient.execute({
        sql: 'INSERT INTO unit_contacts (unit_id, contact_id, priority_order) VALUES (?, ?, 1)',
        args: [unitId, contactId]
      });
    }

    return this.getUnitDetails(unitId);
  }

  async updateUnit(id: string, data: UpdateUnitInput) {
    const now = new Date().toISOString();
    await sqliteClient.execute({
      sql: `
        UPDATE units SET
          name = COALESCE(?, name),
          intra_code = COALESCE(?, intra_code),
          sankhya_code = COALESCE(?, sankhya_code),
          city = COALESCE(?, city),
          state = COALESCE(?, state),
          address = COALESCE(?, address),
          business_hours = COALESCE(?, business_hours),
          phone = COALESCE(?, phone),
          environment = COALESCE(?, environment),
          dependencies = COALESCE(?, dependencies),
          is_active = COALESCE(?, is_active),
          image_url = COALESCE(?, image_url),
          updated_at = ?
        WHERE id = ?
      `,
      args: [
        data.name?.trim() ?? null,
        data.intraCode?.trim() ?? null,
        data.sankhyaCode?.trim() ?? null,
        data.city?.trim() ?? null,
        data.state?.trim() ?? null,
        data.address?.trim() ?? null,
        data.businessHours?.trim() ?? null,
        data.phone?.trim() ?? null,
        data.environment?.trim() ?? null,
        data.dependencies?.trim() ?? null,
        data.isActive !== undefined ? (data.isActive ? 1 : 0) : null,
        data.imageUrl?.trim() ?? null,
        now,
        id
      ]
    });

    return this.getUnitDetails(id);
  }

  async updateUnitImage(unitId: string, imageUrl: string) {
    const now = new Date().toISOString();
    await sqliteClient.execute({
      sql: 'UPDATE units SET image_url = ?, updated_at = ? WHERE id = ?',
      args: [imageUrl, now, unitId]
    });
    return { success: true, unitId, imageUrl };
  }
}
