export interface Transaction {
  transaction_date: string;
  transaction_title_or_description: string;
  amount: number;
  notes: string;
}

export interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  transactions: Transaction[];
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  base64?: string;
}

export interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export interface TransactionTableProps {
  transactions: Transaction[];
  fileName: string;
}
