// export interface Column {
//   name: string;
//   alias: string;
//   width?: string;
//   field?: string;
//   templateShow?: string;
//   enum?: {[key: string]: string | number};
//   isArray?: boolean;
//   cssHeader?: string;
//   cssValue?: string;
// }

export enum VfType {
  DATA = 'DATA',
  SYMBOL = 'SYMBOL',
}

export interface VfField {
  vfTitle: string;
  vfCode: string;
  vfType: VfType;
  vfAcutalField: string;
  vfActualFieldTitle: string;
  vfRenderFunc?: (arg: VfField) => string;
  enum?: {[key: string]: string | number};
  value?: string;
  templateShow?: string;
}

export interface VariantsField {
  title: string;
  field: string;
  variants: VfField[];
}

export interface Column {
  title: string;
  fieldCodes: string[];
  width?: string;
  align?: string;
  vAlign?: string;
  cssHeader?: string;
  cssValue?: string;
}
