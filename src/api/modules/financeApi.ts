import apiClient, { handleApiError } from '../client';

interface FeeStructureData {
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
}

interface PaymentData {
  studentId: number;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  bankName?: string;
  mobileNumber?: string;
  remarks?: string;
}

interface PartialPaymentData {
  studentId: number;
  feeId: number;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
}

export const financeApi = {
  
  createFeeStructure: async (data: FeeStructureData) => {
    try {
      const response = await apiClient.post('/finance/fee-structures', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAllFeeStructures: async () => {
    try {
      const response = await apiClient.get('/finance/fee-structures');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateFeeStructure: async (id: number, data: Partial<FeeStructureData>) => {
    try {
      const response = await apiClient.put(`/finance/fee-structures/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteFeeStructure: async (id: number) => {
    try {
      const response = await apiClient.delete(`/finance/fee-structures/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentFees: async (studentId: number) => {
    try {
      const response = await apiClient.get(`/finance/students/${studentId}/fees`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentFeeSummary: async (studentId: number) => {
    try {
      const response = await apiClient.get(`/finance/students/${studentId}/summary`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getOverdueFees: async () => {
    try {
      const response = await apiClient.get('/finance/fees/overdue');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  applyLateFee: async (feeId: number) => {
    try {
      const response = await apiClient.post(`/finance/fees/${feeId}/apply-late-fee`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  waiveFee: async (feeId: number, amount: number, reason: string) => {
    try {
      const response = await apiClient.post(`/finance/fees/${feeId}/waive?amount=${amount}&reason=${encodeURIComponent(reason)}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  generateStudentFee: async (studentId: number, feeStructureId: number, semester: string, academicYear: number) => {
    try {
      const response = await apiClient.post(`/finance/students/${studentId}/fees?feeStructureId=${feeStructureId}&semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  processPayment: async (data: PaymentData) => {
    try {
      const response = await apiClient.post('/finance/payments', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  processPartialPayment: async (data: PartialPaymentData) => {
    try {
      const response = await apiClient.post('/finance/payments/partial', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAllPayments: async () => {
    try {
      const response = await apiClient.get('/finance/payments');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentPayments: async (studentId: number) => {
    try {
      const response = await apiClient.get(`/finance/students/${studentId}/payments`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  refundPayment: async (paymentId: number, reason: string) => {
    try {
      const response = await apiClient.post(`/finance/payments/${paymentId}/refund?reason=${encodeURIComponent(reason)}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  generateInvoice: async (studentId: number, semester: string, academicYear: number) => {
    try {
      const response = await apiClient.post(`/finance/students/${studentId}/invoices?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentInvoices: async (studentId: number) => {
    try {
      const response = await apiClient.get(`/finance/students/${studentId}/invoices`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAllInvoices: async () => {
    try {
      const response = await apiClient.get('/finance/invoices');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getOverdueInvoices: async () => {
    try {
      const response = await apiClient.get('/finance/invoices/overdue');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  downloadReceipt: async (paymentId: number) => {
    try {
      const response = await apiClient.get(`/finance/payments/${paymentId}/receipt`, {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  downloadInvoice: async (invoiceId: number) => {
    try {
      const response = await apiClient.get(`/finance/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getDailyReport: async (date: string) => {
    try {
      const response = await apiClient.get(`/finance/reports/daily?date=${date}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getMonthlyReport: async (year: number, month: number) => {
    try {
      const response = await apiClient.get(`/finance/reports/monthly?year=${year}&month=${month}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getSemesterReport: async (semester: string, academicYear: number) => {
    try {
      const response = await apiClient.get(`/finance/reports/semester?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
};