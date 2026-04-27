import apiClient, { handleApiError } from '../client';

export const financeApi = {
  // ========== Fee Structure Management ==========
  
  // Create fee structure
  createFeeStructure: async (data) => {
    try {
      const response = await apiClient.post('/finance/fee-structures', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get all fee structures
  getAllFeeStructures: async () => {
    try {
      const response = await apiClient.get('/finance/fee-structures');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update fee structure
  updateFeeStructure: async (id, data) => {
    try {
      const response = await apiClient.put(`/finance/fee-structures/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete fee structure
  deleteFeeStructure: async (id) => {
    try {
      const response = await apiClient.delete(`/finance/fee-structures/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ========== Student Fees ==========

  // Get student fees
  getStudentFees: async (studentId) => {
    try {
      const response = await apiClient.get(`/finance/students/${studentId}/fees`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student fee summary
  getStudentFeeSummary: async (studentId) => {
    try {
      const response = await apiClient.get(`/finance/students/${studentId}/summary`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get overdue fees
  getOverdueFees: async () => {
    try {
      const response = await apiClient.get('/finance/fees/overdue');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Apply late fee
  applyLateFee: async (feeId) => {
    try {
      const response = await apiClient.post(`/finance/fees/${feeId}/apply-late-fee`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Waive fee
  waiveFee: async (feeId, amount, reason) => {
    try {
      const response = await apiClient.post(`/finance/fees/${feeId}/waive?amount=${amount}&reason=${encodeURIComponent(reason)}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Generate fee for student
  generateStudentFee: async (studentId, feeStructureId, semester, academicYear) => {
    try {
      const response = await apiClient.post(`/finance/students/${studentId}/fees?feeStructureId=${feeStructureId}&semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ========== Payment Management ==========

  // Process payment
  processPayment: async (data) => {
    try {
      const response = await apiClient.post('/finance/payments', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Process partial payment
  processPartialPayment: async (data) => {
    try {
      const response = await apiClient.post('/finance/payments/partial', data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get all payments
  getAllPayments: async () => {
    try {
      const response = await apiClient.get('/finance/payments');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student payments
  getStudentPayments: async (studentId) => {
    try {
      const response = await apiClient.get(`/finance/students/${studentId}/payments`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Refund payment
  refundPayment: async (paymentId, reason) => {
    try {
      const response = await apiClient.post(`/finance/payments/${paymentId}/refund?reason=${encodeURIComponent(reason)}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ========== Invoice Management ==========

  // Generate invoice
  generateInvoice: async (studentId, semester, academicYear) => {
    try {
      const response = await apiClient.post(`/finance/students/${studentId}/invoices?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student invoices
  getStudentInvoices: async (studentId) => {
    try {
      const response = await apiClient.get(`/finance/students/${studentId}/invoices`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get all invoices
  getAllInvoices: async () => {
    try {
      const response = await apiClient.get('/finance/invoices');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get overdue invoices
  getOverdueInvoices: async () => {
    try {
      const response = await apiClient.get('/finance/invoices/overdue');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ========== Reports ==========

  // Daily report
  getDailyReport: async (date) => {
    try {
      const response = await apiClient.get(`/finance/reports/daily?date=${date}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Monthly report
  getMonthlyReport: async (year, month) => {
    try {
      const response = await apiClient.get(`/finance/reports/monthly?year=${year}&month=${month}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Semester report
  getSemesterReport: async (semester, academicYear) => {
    try {
      const response = await apiClient.get(`/finance/reports/semester?semester=${semester}&academicYear=${academicYear}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
};