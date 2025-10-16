export enum RoleName {
  ADMIN = 'ADMIN',
  DIRECTOR = 'DIRECTOR',
  AUTHOR = 'AUTHOR',
  STUDENT = 'STUDENT',
  INVESTIGATOR = 'INVESTIGATOR',
  REVIEWER = 'REVIEWER',
  STYLISTIC_EDITOR = 'STYLISTIC_EDITOR',
  DESIGNER = 'DESIGNER',
}

export const ROLE_TRANSLATIONS: Record<RoleName, string> = {
  [RoleName.ADMIN]: 'Administrador',
  [RoleName.DIRECTOR]: 'Director',
  [RoleName.AUTHOR]: 'Autor',
  [RoleName.STUDENT]: 'Estudiante',
  [RoleName.INVESTIGATOR]: 'Investigador',
  [RoleName.REVIEWER]: 'Revisor',
  [RoleName.STYLISTIC_EDITOR]: 'Editor Estilístico',
  [RoleName.DESIGNER]: 'Diseñador',
};