export interface Column {
  name: string;
  alias: string;
  width?: string;
  field?: string;
  templateShow?: string;
  enum?: {[key: string]: string | number};
  isArray?: boolean;
  cssHeader?: string;
  cssValue?: string;
}