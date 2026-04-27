export interface FeeStructureRequest {
  feeType: string;
  category?: string;
  description: string;
  amount: number;
  department?: string;
  faculty?: string;
  isMandatory?: boolean;
  academicYear?: number;
  semester?: string;
  dueDate?: string;
  gracePeriodDays?: number;
  lateFeePercentage?: number;
}

export interface FeeStructureResponse {
  id: number;
  feeType: string;
  category: string;
  description: string;
  amount: number;
  department: string;
  faculty: string;
  isMandatory: boolean;
  academicYear: number;
  semester: string;
  dueDate: string;
  gracePeriodDays: number;
  lateFeePercentage: number;
  isActive: boolean;
}

export interface FeeResponse {
  id: number;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  feeType: string;
  description: string;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  lateFee: number;
  status: string;
  dueDate: string;
  invoiceNumber: string;
  semester: string;
  academicYear: number;
  isLate: boolean;
  isMandatory: boolean;
  createdAt: string;
  message?: string;
}

export interface FeeSummary {
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  totalFees: number;
  totalPaid: number;
  totalOutstanding: number;
  totalLateFees: number;
  pendingFeesCount: number;
  overdueFeesCount: number;
  recentFees: FeeResponse[];
  message: string;
}

export interface PaymentRequest {
  studentId: number;
  feeId?: number;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  bankName?: string;
  chequeNumber?: string;
  mobileNumber?: string;
  remarks?: string;
  paymentDate?: string;
}

export interface PaymentResponse {
  id: number;
  transactionId: string;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  feeId: number;
  feeDescription: string;
  amount: number;
  paymentMethod: string;
  status: string;
  referenceNumber: string;
  receiptNumber: string;
  receivedBy: string;
  remarks: string;
  paymentDate: string;
  createdAt: string;
  message: string;
}

export interface InvoiceResponse {
  id: number;
  invoiceNumber: string;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  fees: FeeResponse[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  semester: string;
  academicYear: number;
  issueDate: string;
  dueDate: string;
  status: string;
  createdAt: string;
  message: string;
}

export interface FinancialReport {
  reportDate: string;
  reportPeriod: string;
  totalFeesGenerated: number;
  totalPaymentsReceived: number;
  totalOutstanding: number;
  totalOverdue: number;
  feesByType: Record<string, number>;
  paymentsByMethod: Record<string, number>;
  collectionsByDepartment: Record<string, number>;
  totalStudentsWithOutstanding: number;
  totalOverdueAccounts: number;
  totalTransactions: number;
  message: string;
}