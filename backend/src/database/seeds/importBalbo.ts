import { sqliteClient } from '../connection.js';

export async function importBalbo() {
  console.log('Importing Grupo Balbo clients, units, circuits, and procedures...');
  
  const now = new Date().toISOString();

  // 1. Cliente Grupo Balbo
  const clientId = 'grupo-balbo';
  await sqliteClient.execute({
    sql: `INSERT INTO clients (id, name, is_vip, economic_group, manager_name, gn_name, sankhya_code, description, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET 
            name = excluded.name, 
            is_vip = excluded.is_vip, 
            gn_name = excluded.gn_name,
            manager_name = excluded.manager_name,
            description = excluded.description,
            updated_at = excluded.updated_at`,
    args: [
      clientId,
      'Grupo Balbo',
      1, // VIP
      'Grupo Balbo',
      'Marta Corrêa',
      'Luis Henrique',
      '882005329',
      'Cliente VIP - Grupo Balbo. Usinas Santo Antônio, São Francisco, Uberaba, unidades administrativas e torres de repetição.',
      now,
      now
    ]
  });

  // 2. Unidades confirmadas do Grupo Balbo (Tabela 1089 TablePress + Postagens do CCO)
  const unitsData = [
    {
      id: 'balbo-usa-concentrador',
      name: 'USA — Usina Santo Antônio | Concentrador',
      intraCode: 'USINA SANTO ANTONIO | CONCENTRADOR',
      sankhyaCode: '8081',
      city: 'Sertãozinho',
      state: 'SP',
      address: 'Fazenda Santo Antônio, Zona Rural, Sertãozinho-SP',
      isActive: 1,
      circuits: [
        { operator: 'Cliente', technology: 'Fibra', speedMbps: 100, circuitId: 'L2L-USA-UFRA', isPrimary: true, notes: 'L2L 100 Mbps interligação direta USA - UFRA' },
        { operator: 'Vivo', technology: 'Fibra', speedMbps: 200, circuitId: '887652', lpIp: '115993942260999', lpVpn: '115993942272490', isPrimary: false, notes: 'Internet 200 Mbps IP dedicado' },
        { operator: 'Algar', technology: 'Rádio', speedMbps: 120, circuitId: '81628', isPrimary: false, notes: 'Internet 120 Mbps via rádio' },
        { operator: 'Algar', technology: 'Rádio', speedMbps: 80, circuitId: '7352260', isPrimary: false, notes: 'MPLS 80 Mbps via rádio' }
      ]
    },
    {
      id: 'balbo-usina-uberaba',
      name: 'UBE — Usina Uberaba',
      intraCode: 'USINA UBERABA',
      sankhyaCode: '8083',
      city: 'Uberaba',
      state: 'MG',
      address: 'Estrada Municipal, 304 - Fazenda Santo Antônio, Zona Rural, Uberaba-MG',
      isActive: 1,
      circuits: [
        { operator: 'Microset', technology: 'Rádio', speedMbps: 50, isPrimary: true, notes: 'MPLS rádio 50 Mbps' },
        { operator: 'Microset +Web', technology: 'Rádio', speedMbps: 100, lpIp: 'TCR: 843_20200069', isPrimary: false, notes: 'IP dedicado 100 Mbps Balbo Uberaba' },
        { operator: 'Algar', technology: 'Rádio', speedMbps: 300, circuitId: '0811009', isPrimary: false, notes: 'Internet rádio 300 Mbps' },
        { operator: 'Vivo', technology: 'Fibra', lpIp: '325480155525395', lpVpn: '325480165836998', isPrimary: false, notes: 'LP IP dedicado / MPLS VPN' }
      ]
    },
    {
      id: 'balbo-ufra-usina-sao-francisco',
      name: 'UFRA — Usina São Francisco',
      intraCode: 'USINA SAO FRANCISCO',
      sankhyaCode: '9006',
      city: 'Sertãozinho',
      state: 'SP',
      address: 'Fazenda São Francisco, Sertãozinho-SP',
      isActive: 1,
      circuits: [
        { operator: 'Cliente', technology: 'Fibra', speedMbps: 100, isPrimary: true, notes: 'Interligação direta USA - UFRA' },
        { operator: 'Microset', technology: 'Rádio', speedMbps: 50, isPrimary: false, notes: 'Link de contingência Microset' }
      ]
    },
    {
      id: 'balbo-usina-sao-francisco-escritorio',
      name: 'Usina São Francisco | Escritório Fiúsa',
      intraCode: 'USINA SAO FRANCISCO | ESCRITORIO',
      sankhyaCode: '8082',
      city: 'Ribeirão Preto',
      state: 'SP',
      address: 'Av. Professor João Fiúsa, 1901, Sala 204, Jardim São Luiz, Ribeirão Preto-SP',
      isActive: 1,
      circuits: [
        { operator: 'Algar', technology: 'Fibra', speedMbps: 20, circuitId: '112781', isPrimary: true, notes: 'MPLS 20 Mbps' },
        { operator: 'Vivo', technology: 'Fibra', speedMbps: 10, isPrimary: false, notes: 'IP 10 Mbps contingência' }
      ]
    },
    {
      id: 'balbo-usina-sao-francisco-barracao',
      name: 'Usina São Francisco | Barracão Barrinha',
      intraCode: 'USINA SAO FRANCISCO | BARRACAO - BARRINHA',
      sankhyaCode: '24529',
      city: 'Barrinha',
      state: 'SP',
      address: 'Avenida Giovani Marcari, 750, Quadra 04, Área Industrial, Barrinha-SP',
      isActive: 1,
      circuits: [
        { operator: 'Microset', technology: 'Rádio', speedMbps: 20, isPrimary: true, notes: 'Ponto a ponto Barracão Barrinha' }
      ]
    },
    {
      id: 'balbo-barueri-gupe',
      name: 'Barueri GUPE',
      intraCode: 'BARUERI GUPE',
      sankhyaCode: '8703',
      city: 'Barueri',
      state: 'SP',
      address: 'Avenida Gupe, 10767, Jardim Belval, Barueri-SP',
      isActive: 1,
      circuits: [
        { operator: 'Vivo', technology: 'Fibra', speedMbps: 50, isPrimary: true, notes: 'IP dedicado Barueri' }
      ]
    },
    {
      id: 'balbo-cantagalo',
      name: 'Cantagalo — Escritório SP',
      intraCode: 'CANTAGALO',
      sankhyaCode: '8701',
      city: 'São Paulo',
      state: 'SP',
      address: 'Rua Cantagalo, 74, Tatuapé, São Paulo-SP',
      isActive: 1,
      circuits: [
        { operator: 'Vivo', technology: 'Fibra', speedMbps: 50, isPrimary: true, notes: 'Link Escritório Cantagalo' }
      ]
    },
    {
      id: 'balbo-native-guarulhos',
      name: 'Native SP | Borba Gato (CD Guarulhos)',
      intraCode: 'NATIVE SP | BORBA GATO',
      sankhyaCode: '8702',
      city: 'Guarulhos',
      state: 'SP',
      address: 'Centro de Distribuição Native, Borba Gato, Guarulhos-SP',
      isActive: 1,
      circuits: [
        { operator: 'Vivo', technology: 'Fibra', speedMbps: 50, isPrimary: true, notes: 'IP dedicado Borba Gato Guarulhos' }
      ]
    },
    {
      id: 'balbo-torre-sertaozinho',
      name: 'Torre Sertãozinho',
      intraCode: 'TORRE SERTAOZINHO',
      sankhyaCode: '28348',
      city: 'Sertãozinho',
      state: 'SP',
      address: 'Estrada Municipal Jacomo Nelson Balbo, Setor Industrial Nordeste, Sertãozinho-SP',
      isActive: 1,
      circuits: [
        { operator: 'Microset', technology: 'Rádio', speedMbps: 100, isPrimary: true, notes: 'Backbone de repetição Torre Sertãozinho' }
      ]
    },
    {
      id: 'balbo-torre-altinopolis',
      name: 'Torre Altinópolis',
      intraCode: 'TORRE ALTINOPOLIS',
      sankhyaCode: '28347',
      city: 'Altinópolis',
      state: 'SP',
      address: 'Ponto de Repetição Torre Altinópolis, Altinópolis-SP',
      isActive: 1,
      circuits: [
        { operator: 'Microset', technology: 'Rádio', speedMbps: 100, isPrimary: true, notes: 'Backbone de repetição Torre Altinópolis' }
      ]
    },
    {
      id: 'balbo-sao-paulo-sede',
      name: 'São Paulo — Sede Administrativa',
      intraCode: 'GRUPO BALBO - SAO PAULO',
      sankhyaCode: '9273',
      city: 'São Paulo',
      state: 'SP',
      address: 'Avenida Cantagalo, 74, Conjunto 1007, Vila Gomes Cardim, São Paulo-SP',
      isActive: 1,
      circuits: [
        { operator: 'Vivo', technology: 'Fibra', speedMbps: 50, isPrimary: true, notes: 'Sede Administrativa / VPN Colaboradores' }
      ]
    },
    {
      id: 'balbo-imobiliaria',
      name: 'Imobiliária Cruz das Posses (Desativado)',
      intraCode: 'IMOBILIARIA',
      sankhyaCode: '4394',
      city: 'Cruz das Posses',
      state: 'SP',
      address: 'Rua Manoel Vitorino, 805, Centro, Cruz das Posses-SP',
      isActive: 0,
      circuits: [
        { operator: 'Client Telecom / Nicnet', technology: 'Fibra', speedMbps: 50, isPrimary: true, notes: 'Desativado em 13/07/2021' }
      ]
    },
    {
      id: 'balbo-quiosque-native',
      name: 'Quiosque Native — Ribeirão Preto (Desativado)',
      intraCode: 'QUIOSQUE NATIVE',
      sankhyaCode: '28392',
      city: 'Ribeirão Preto',
      state: 'SP',
      address: 'Ribeirão Shopping, Ribeirão Preto-SP',
      isActive: 0,
      circuits: [
        { operator: 'Microset', technology: 'Rádio', speedMbps: 10, isPrimary: true, notes: 'Desativado em 18/12/2024' }
      ]
    }
  ];

  for (const u of unitsData) {
    await sqliteClient.execute({
      sql: `INSERT INTO units (id, client_id, name, intra_code, sankhya_code, city, state, address, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
              name = excluded.name, 
              intra_code = excluded.intra_code,
              sankhya_code = excluded.sankhya_code,
              city = excluded.city, 
              state = excluded.state,
              address = excluded.address,
              is_active = excluded.is_active,
              updated_at = excluded.updated_at`,
      args: [u.id, clientId, u.name, u.intraCode || null, u.sankhyaCode || null, u.city || null, u.state || null, u.address || null, u.isActive, now, now]
    });

    for (let cIdx = 0; cIdx < u.circuits.length; cIdx++) {
      const c: any = u.circuits[cIdx];
      const circuitId = `${u.id}-c${cIdx + 1}`;
      await sqliteClient.execute({
        sql: `INSERT INTO circuits (id, unit_id, operator, technology, speed_mbps, circuit_id, lp_ip, lp_vpn, is_primary, notes, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET 
                operator = excluded.operator, 
                technology = excluded.technology,
                speed_mbps = excluded.speed_mbps, 
                circuit_id = excluded.circuit_id,
                lp_ip = excluded.lp_ip,
                lp_vpn = excluded.lp_vpn,
                is_primary = excluded.is_primary,
                notes = excluded.notes`,
        args: [circuitId, u.id, c.operator, c.technology || null, c.speedMbps || null, c.circuitId || null, c.lpIp || null, c.lpVpn || null, c.isPrimary ? 1 : 0, c.notes || null, now]
      });
    }
  }

  // 3. Contatos operacionais e Escalonamentos
  const contacts = [
    { id: 'ct_balbo_douglas', name: 'Douglas', roleDescription: 'Responsável Técnico / Comercial Cliente (1º Contato)', phone: '(16) 3946-4062', schedule: 'Comercial' },
    { id: 'ct_balbo_jose_carlos', name: 'José Carlos', roleDescription: 'Plantão Técnico / Infraestrutura', phone: '(16) 3946-4016', mobile: '(16) 98146-0581', whatsapp: '(16) 98146-0581', schedule: 'Fora do Horário Comercial / Plantão' },
    { id: 'ct_balbo_fabiano', name: 'Fabiano', roleDescription: 'Infraestrutura - Usina Uberaba', mobile: '(34) 99112-3317', whatsapp: '(34) 98407-7517', schedule: 'Infra / Usina Uberaba' },
    { id: 'ct_balbo_joao_marcos', name: 'João Marcos', roleDescription: 'Infraestrutura', phone: '(16) 3946-4048', mobile: '(16) 99303-2696', whatsapp: '(16) 99303-2696', schedule: 'Infraestrutura' },
    { id: 'ct_balbo_renato_jose', name: 'Renato José', roleDescription: 'Infraestrutura', mobile: '(16) 98226-2828', whatsapp: '(16) 98226-2828', schedule: 'Infraestrutura' },
    { id: 'ct_balbo_junior_ciqueira', name: 'Junior Ciqueira', roleDescription: 'Sistemas - Usina Uberaba', mobile: '(16) 98151-8686', whatsapp: '(16) 98151-8686', schedule: 'Sistemas / Uberaba' },
    { id: 'ct_microset_marta', name: 'Marta Corrêa', roleDescription: 'Escalonamento Interno Microset CCO', mobile: '(16) 99770-4584', whatsapp: '(16) 99770-4584', email: 'marta.correa@microset.net.br', schedule: 'Operacional / CCO' },
    { id: 'ct_microset_luis_henrique', name: 'Luis Henrique', roleDescription: 'Gerente de Negócios (GN Microset)', email: 'luis.henrique@microset.net.br', schedule: 'Gerencial' },
    { id: 'ct_algar_leydiane', name: 'Leydiane Reis', roleDescription: 'SDM Oficial - Algar Atendimento Premium', phone: '(34) 99781-2888', mobile: '(34) 99781-2888', whatsapp: '(34) 99781-2888', email: 'leydiane@algartelecom.com.br', schedule: 'Comercial / Escalonamento Algar' },
    { id: 'ct_algar_lucas_medeiros', name: 'Lucas Medeiros', roleDescription: 'SDM Substituto - Algar Atendimento Premium', phone: '(34) 99869-0316', mobile: '(34) 99869-0316', whatsapp: '(34) 99869-0316', email: 'lucasom@algartelecom.com.br', schedule: 'Férias SDM Oficial' },
    { id: 'ct_algar_raissa_gomide', name: 'Raissa Gomide', roleDescription: 'Gestora Atendimento Premium Algar', phone: '(19) 99985-9680', mobile: '(19) 99985-9680', whatsapp: '(19) 99985-9680', email: 'raissa@algartelecom.com.br', schedule: 'Gestão Operacional Algar' },
    { id: 'ct_algar_tulio_japaulo', name: 'Túlio Japaulo', roleDescription: 'Consultor Comercial Algar Telecom', phone: '(16) 99143-0035', mobile: '(16) 99143-0035', whatsapp: '(16) 99143-0035', email: 'tulioj@algartelecom.com.br', schedule: 'Comercial Algar' },
    { id: 'ct_algar_francisco_aguila', name: 'Francisco Aguila', roleDescription: 'Gerente Regional Algar Telecom', phone: '(16) 99965-0501', mobile: '(16) 99965-0501', whatsapp: '(16) 99965-0501', email: 'francisco@algartelecom.com.br', schedule: 'Gerência Regional Algar' }
  ];

  for (const ct of contacts) {
    await sqliteClient.execute({
      sql: `INSERT INTO contacts (id, name, role_description, phone, mobile, whatsapp, email, schedule, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
              name = excluded.name, 
              role_description = excluded.role_description,
              phone = excluded.phone, 
              mobile = excluded.mobile,
              whatsapp = excluded.whatsapp,
              email = excluded.email,
              schedule = excluded.schedule`,
      args: [ct.id, ct.name, ct.roleDescription, ct.phone || null, ct.mobile || null, ct.whatsapp || null, (ct as any).email || null, ct.schedule || null, now]
    });
  }

  // 4. Procedimentos Oficiais Completos do Grupo Balbo
  const proceduresData = [
    {
      id: 'proc_balbo_telecom',
      category: 'telecom',
      content: `### Procedimento Oficial de Alertas — TELECOM (Grupo Balbo)

> [!IMPORTANT]
> No cliente Balbo, Telecom e Infraestrutura são dois contratos diferentes. Siga o procedimento correspondente ao tipo de evento.

#### Exemplos de Alertas de Telecom:
- MPLS-GRUPO-BALBO-MATRIZ-M7-FORA!
- RM7-GRUPO-BALBO-SAO-FRAN-BORBA-FORA!
- IP-GRUPO-BALBO-SAO-FRAN-BARRINHA-M7-FORA!
- LINK-IP-US-STO-ANTONIO-FORA!
- FIBRA-L2L-US-SAO-FRANCISCO

---

#### 1. Horário Comercial:
1. Ligar imediatamente para Douglas (Cliente): (16) 3946-4062.
2. Ligar para Marta Corrêa (Microset CCO / GN): (16) 99770-4584.
3. Registrar e avisar imediatamente o andamento das tratativas e finalização em dois grupos de WhatsApp:
   - Grupo do Cliente: "GB-MICROSET - NOC - INF"
   - Grupo Interno Microset: "INT - Balbo CCO"
   *Sempre incluir o protocolo da operadora/fornecedor quando houver.*

#### 2. Fora do Horário Comercial:
1. Enviar mensagem de WhatsApp para José Carlos (Cliente): (16) 98146-0581.
2. Encerrar o chamado com a causa raiz: Alerta > Cliente Informado.

> [!CAUTION]
> NÃO LIMITAR AS INFORMAÇÕES SOMENTE NO GRUPO DO CLIENTE. Sempre manter o grupo interno "INT - Balbo CCO" espelhado e atualizado.`
    },
    {
      id: 'proc_balbo_infra',
      category: 'infra',
      content: `### Procedimento Oficial — INFRAESTRUTURA & SERVIDORES (Grupo Balbo)

#### Exemplos de Alertas de Infraestrutura:
- US Sao Francisco - Guarulhos - Switch-Gateway-HP
- US Uberaba - PABX
- US Sao Francisco - Ribeirao Preto - Servidores Simplivity e OVCs - 02

---

#### Instrução Operacional:
1. Reclassificar o chamado como: Monitoramento > Alerta de servidor, ou Monitoramento > Alerta de Infra.
2. Encerrar o chamado imediatamente com a causa raiz Cliente Informado.
3. Os alertas de infraestrutura são encaminhados automaticamente no grupo de WhatsApp e por e-mail para a equipe do cliente.`
    },
    {
      id: 'proc_balbo_escalonamento_algar',
      category: 'escalonamento',
      content: `### Escalonamento Algar Telecom — Atendimento Premium (Grupo Balbo)

> [!NOTE]
> Sempre acione o SDM (Service Delivery Manager) ao abrir chamados para escalar a Algar Telecom.

| Nível / Função | Responsável | Telefone | E-mail |
| :--- | :--- | :--- | :--- |
| **SDM Oficial** | **Leydiane Reis** | (34) 99781-2888 | leydiane@algartelecom.com.br |
| **SDM Substituto (Férias)** | **Lucas Medeiros** | (34) 99869-0316 | lucasom@algartelecom.com.br |
| **Gestora Premium** | **Raissa Gomide** | (19) 99985-9680 | raissa@algartelecom.com.br |
| **Consultor Comercial** | **Túlio Japaulo** | (16) 99143-0035 | tulioj@algartelecom.com.br |
| **Gerente Regional** | **Francisco Aguila** | (16) 99965-0501 | francisco@algartelecom.com.br |`
    },
    {
      id: 'proc_balbo_uberaba',
      category: 'escalonamento',
      content: `### Escalonamento Operacional — Usina Uberaba (8083)

#### 1. Escalonamento de Sistema:
- 1º Contato Sistema: Junior Ciqueira - Cel: (16) 98151-8686
- Horário Comercial: Ligar para Douglas - Tel: (16) 3946-4062
- Fora do Horário Comercial: Enviar WhatsApp para José Carlos - Cel: (16) 98146-0581
- WhatsApp do Grupo: G BALBO MONITORAMENTO
- Causa Raiz de Encerramento: Alerta > Cliente Informado

#### 2. Escalonamento de Infraestrutura:
- 1º Contato: Douglas - (16) 3946-4062
- 2º Contato: José Carlos - (16) 3946-4016 / (16) 98146-0581
- 3º Contato: Fabiano - (34) 99112-3317 / (34) 98407-7517
- 4º Contato: João Marcos - (16) 3946-4048 / (16) 99303-2696
- 5º Contato: Renato José - (16) 98226-2828`
    }
  ];

  for (const p of proceduresData) {
    await sqliteClient.execute({
      sql: `INSERT INTO procedures (id, client_id, category, content, version, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
              category = excluded.category,
              content = excluded.content, 
              updated_at = excluded.updated_at`,
      args: [p.id, clientId, p.category, p.content, 1, now]
    });
  }

  console.log(`  Grupo Balbo imported: ${unitsData.length} units, ${contacts.length} contacts, ${proceduresData.length} procedures.`);
}
