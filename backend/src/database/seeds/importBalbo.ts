import { sqliteClient } from '../connection.js';

export async function importBalbo() {
  console.log('Importing Grupo Balbo clients, units, circuits, and procedures...');
  
  const now = new Date().toISOString();

  // 1. Cliente Grupo Balbo
  const clientId = 'grupo-balbo';
  await sqliteClient.execute({
    sql: `INSERT INTO clients (id, name, is_vip, economic_group, manager_name, gn_name, sankhya_code, description, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET name = excluded.name, is_vip = excluded.is_vip, gn_name = excluded.gn_name`,
    args: [
      clientId,
      'Grupo Balbo',
      1, // VIP
      'Grupo Balbo',
      'Marta Corrêa',
      'Luis Henrique',
      '882005329',
      'Cliente Grupo Balbo. Cadastro estruturado com base no levantamento CCO para handover retroativo.',
      now,
      now
    ]
  });

  // 2. Unidades confirmadas do Grupo Balbo
  const unitsData = [
    {
      id: 'balbo-usa-concentrador',
      name: 'USA — Usina Santo Antônio — Concentrador',
      intraCode: 'USINA SANTO ANTONIO | CONCENTRADOR',
      sankhyaCode: '8081',
      city: 'Sertãozinho',
      state: 'SP',
      address: 'Fazenda Santo Antônio, Zona Rural, Sertãozinho-SP',
      circuits: [
        { operator: 'Cliente', technology: 'Fibra', speedMbps: 100, isPrimary: true, notes: 'L2L 100 Mbps' },
        { operator: 'Vivo', technology: 'Fibra', speedMbps: 200, circuitId: '887652', lpIp: '115993942260999', lpVpn: '115993942272490', isPrimary: false, notes: 'Internet 200 Mbps / IP dedicado' },
        { operator: 'Algar', technology: 'Rádio', speedMbps: 120, circuitId: '81628', isPrimary: false, notes: 'Internet 120 Mbps rádio' },
        { operator: 'Algar', technology: 'Rádio', speedMbps: 80, circuitId: '7352260', isPrimary: false, notes: 'MPLS 80 Mbps rádio' }
      ]
    },
    {
      id: 'balbo-usina-uberaba',
      name: 'UBE — Usina Uberaba',
      intraCode: 'USINA UBERABA',
      sankhyaCode: '8083',
      city: 'Uberaba',
      state: 'MG',
      address: 'Estrada Municipal, 304 — Fazenda Santo Antônio, Zona Rural, Uberaba-MG',
      circuits: [
        { operator: 'Microset', technology: 'Rádio', speedMbps: 50, isPrimary: true, notes: 'MPLS rádio 50 Mbps' },
        { operator: 'Microset + Web', technology: 'Rádio', speedMbps: 100, isPrimary: false, notes: 'IP dedicado 100 Mbps' },
        { operator: 'Algar', technology: 'Rádio', speedMbps: 300, circuitId: '0811009', isPrimary: false, notes: 'Internet rádio 300 Mbps' },
        { operator: 'Vivo', technology: 'Fibra', lpIp: '325480155525395', lpVpn: '325480165836998', isPrimary: false, notes: 'LP IP dedicado / MPLS VPN' }
      ]
    },
    {
      id: 'balbo-ufra-usina-sao-francisco',
      name: 'UFRA — Usina São Francisco',
      intraCode: 'USINA SAO FRANCISCO',
      sankhyaCode: '8082',
      city: 'Sertãozinho',
      state: 'SP',
      address: 'Fazenda São Francisco, Sertãozinho-SP',
      circuits: [
        { operator: 'Cliente', technology: 'Fibra', speedMbps: 100, isPrimary: true, notes: 'Interligação direta USA - UFRA' },
        { operator: 'Microset', technology: 'Rádio', speedMbps: 50, isPrimary: false, notes: 'Link de contingência' }
      ]
    },
    {
      id: 'balbo-native-guarulhos',
      name: 'Native — CD Guarulhos',
      intraCode: 'NATIVE GUARULHOS',
      city: 'Guarulhos',
      state: 'SP',
      address: 'Centro de Distribuição Native, Guarulhos-SP',
      circuits: [
        { operator: 'Vivo', technology: 'Fibra', speedMbps: 50, isPrimary: true, notes: 'IP dedicado' }
      ]
    },
    {
      id: 'balbo-native-fiusa',
      name: 'Native / Usina São Francisco — Escritório Fiúsa',
      intraCode: 'ESCRITORIO FIUSA',
      city: 'Ribeirão Preto',
      state: 'SP',
      address: 'Av. Professor João Fiúsa, 1901, Sala 204, Jardim São Luiz, Ribeirão Preto-SP',
      circuits: [
        { operator: 'Algar', technology: 'Fibra', speedMbps: 20, circuitId: '112781', isPrimary: true, notes: 'MPLS 20 Mbps' },
        { operator: 'Vivo', technology: 'Fibra', speedMbps: 10, isPrimary: false, notes: 'IP 10 Mbps' }
      ]
    },
    {
      id: 'balbo-barrinha-deposito',
      name: 'Barrinha — Depósito',
      intraCode: 'BARRINHA DEPOSITO',
      city: 'Barrinha',
      state: 'SP',
      address: 'Depósito Barrinha, SP',
      circuits: [
        { operator: 'Microset', technology: 'Rádio', speedMbps: 20, isPrimary: true, notes: 'Ponto a ponto' }
      ]
    },
    {
      id: 'balbo-santa-ernestina',
      name: 'Santa Ernestina',
      intraCode: 'SANTA ERNESTINA',
      city: 'Santa Ernestina',
      state: 'SP',
      address: 'Unidade Santa Ernestina, SP',
      circuits: [
        { operator: 'Microset', technology: 'Rádio', speedMbps: 20, isPrimary: true, notes: 'Link operacional' }
      ]
    },
    {
      id: 'balbo-torre-sertaozinho',
      name: 'Torre Sertãozinho',
      intraCode: 'TORRE SERTAOZINHO',
      city: 'Sertãozinho',
      state: 'SP',
      address: 'Ponto de Repetição Torre, Sertãozinho-SP',
      circuits: [
        { operator: 'Microset', technology: 'Rádio', speedMbps: 100, isPrimary: true, notes: 'Backbone de repetição' }
      ]
    }
  ];

  let unitsCount = 0;
  let circuitsCount = 0;

  for (const u of unitsData) {
    await sqliteClient.execute({
      sql: `INSERT INTO units (id, client_id, name, intra_code, sankhya_code, city, state, address, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET name = excluded.name, city = excluded.city, state = excluded.state`,
      args: [u.id, clientId, u.name, u.intraCode || null, u.sankhyaCode || null, u.city || null, u.state || null, u.address || null, 1, now, now]
    });
    unitsCount++;

    for (let cIdx = 0; cIdx < u.circuits.length; cIdx++) {
      const c: any = u.circuits[cIdx];
      const circuitId = `${u.id}-c${cIdx + 1}`;
      await sqliteClient.execute({
        sql: `INSERT INTO circuits (id, unit_id, operator, technology, speed_mbps, circuit_id, lp_ip, lp_vpn, is_primary, notes, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET operator = excluded.operator, speed_mbps = excluded.speed_mbps, notes = excluded.notes`,
        args: [circuitId, u.id, c.operator, c.technology, c.speedMbps || null, c.circuitId || null, c.lpIp || null, c.lpVpn || null, c.isPrimary ? 1 : 0, c.notes || null, now]
      });
      circuitsCount++;
    }
  }

  // 3. Contatos operacionais e Escalonamentos
  const contacts = [
    { id: 'ct_douglas_balbo', name: 'Douglas', roleDescription: 'Responsável Cliente Comercial', phone: '(16) 3946-4062', schedule: 'Comercial' },
    { id: 'ct_jose_carlos_balbo', name: 'José Carlos', roleDescription: 'Plantão Cliente Fora Horário', mobile: '(16) 98146-0581', whatsapp: '(16) 98146-0581', schedule: 'Fora do Horário Comercial' },
    { id: 'ct_marta_microset', name: 'Marta Corrêa', roleDescription: 'Escalonamento Interno Microset CCO', schedule: 'Operacional' },
    { id: 'ct_luis_microset', name: 'Luis Henrique', roleDescription: 'Gerente de Negócios (GN)', schedule: 'Gerencial' }
  ];

  for (const ct of contacts) {
    await sqliteClient.execute({
      sql: `INSERT INTO contacts (id, name, role_description, phone, mobile, whatsapp, schedule, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET name = excluded.name, phone = excluded.phone, whatsapp = excluded.whatsapp`,
      args: [ct.id, ct.name, ct.roleDescription, ct.phone || null, ct.mobile || null, ct.whatsapp || null, ct.schedule || null, now]
    });
  }

  // 4. Procedimento Operacional Padrão Balbo
  await sqliteClient.execute({
    sql: `INSERT INTO procedures (id, client_id, category, content, version, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`,
    args: [
      'proc_balbo_standard',
      clientId,
      'telecom',
      `### Procedimento Operacional Padrão — Grupo Balbo
1. Ao receber um alerta, ligar imediatamente para Douglas no horário comercial: (16) 3946-4062.
2. Após o contato com o cliente, realizar o escalonamento interno imediato; responsável inicial: Marta Corrêa.
3. Fora do horário comercial, acionar José Carlos pelo WhatsApp: (16) 98146-0581.
4. Registrar o atendimento e a finalização nos grupos GB-MICROSET - NOC - INF e INT - Balbo CCO.
5. Não limitar as informações somente ao grupo do cliente.
6. Para alertas de servidor, reclassificar como Cliente Informado e encerrar conforme o procedimento vigente.`,
      1,
      now
    ]
  });

  console.log(`  Grupo Balbo imported: ${unitsCount} units, ${circuitsCount} circuits, ${contacts.length} contacts.`);
}
