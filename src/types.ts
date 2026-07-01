export interface User {
  id: string;
  name: string;
  role: "Officer" | "Unit Head" | "Manager" | "Admin";
  department: string;
}

export interface DocumentVersion {
  version: number;
  content: string;
  updatedBy: string;
  timestamp: string;
}

export interface DocumentSignature {
  role: string;
  signedBy: string;
  timestamp: string;
  hash: string;
}

export interface Document {
  id: string;
  runningNumber: string;
  title: string;
  content: string;
  status: "Draft" | "Pending Unit Head" | "Pending Manager" | "Approved" | "Rejected";
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  versions: DocumentVersion[];
  signatures: DocumentSignature[];
}

export interface AuditLog {
  id: string;
  docId: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
}
