export const USER_ROLES = {
  ADMIN: 'ADMIN',
  COORDENADOR: 'COORDENADOR',
  USUARIO: 'USUARIO'
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const PERMISSIONS = {
  CEM: 'CEM',
  APROVAR_ALTERACOES: 'APROVAR_ALTERACOES',
  GERENCIAR_USUARIOS: 'GERENCIAR_USUARIOS',
  EDITAR_CADASTROS: 'EDITAR_CADASTROS'
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const CEM_ANSWER_TYPES = {
  CONFORME: 'conforme',
  NAO_CONFORME: 'nao-conforme',
  PARCIALMENTE_CONFORME: 'parcialmente-conforme',
  NA: 'na'
} as const;

export type CemAnswerType = (typeof CEM_ANSWER_TYPES)[keyof typeof CEM_ANSWER_TYPES];

export const CHANGE_REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const;

export type ChangeRequestStatus = (typeof CHANGE_REQUEST_STATUS)[keyof typeof CHANGE_REQUEST_STATUS];

export const SYNC_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
} as const;
