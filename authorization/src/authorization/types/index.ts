export const queueGroupName = 'authorization-service';

/**
 * @desc field names that can be added by the user
 */
export const enum FieldName {
  CHECKBOX = 'CHECKBOX',
  COMPANY = 'COMPANY',
  JOB_TITLE = 'JOB_TITLE',
  FULL_NAME = 'FULL_NAME',
  EMAIL = 'EMAIL',
  SIGNATURE = 'SIGNATURE',
  TEXT = 'TEXT',
  INITIALS = 'INITIALS',
  DATE = 'DATE',
}

/**
 * @desc field types
 */
export const enum FieldType {
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
  CHECK_BOX = 'CHECK_BOX',
  DATE = 'DATE',
}

/**
 *@desc Auth types for recepients
 */
export const enum AuthType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  OFFLINE = 'OFFLINE',
  NONE = 'NONE',
}

/**
 * @desc Action types for recepients
 */
export const enum ActionType {
  SIGN = 'SIGN',
  VIEW = 'VIEW',
}

export const enum ActionStatus {
  SIGNED = 'SIGNED',
  VIEWED = 'VIEWED',
  DECLINED = 'DECLINED',
  RECEIVED = 'RECEIVED',
}
