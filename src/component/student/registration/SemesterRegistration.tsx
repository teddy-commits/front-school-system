import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { registrationApi } from '../../../api/modules/registrationApi';
import { financeApi } from '../../../api/modules/financeApi';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  X,
  ShoppingCart,
  Banknote,
  Building2,
  Smartphone,
  Loader,
  Receipt
} from 'lucide-react';
import toast from 'react-hot-toast';

// ==================== Interfaces ====================

interface AvailableCourse {
  courseId: number;
  courseCode: string;
  courseName: string;
  description: string;
  credits: number;
  department: string;
  faculty: string;
  semester: string;
  academicYear: number;
  instructorName: string;
  instructorEmail: string;
  maxStudents: number;
  enrolledStudents: number;
  availableSeats: number;
  prerequisites: string;
  schedule: string;
  room: string;
  isEligible: boolean;
  eligibilityMessage: string;
}

interface CartItem {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  fee: number;
}

interface RegisteredCourse {
  registrationId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  schedule: string;
  room: string;
  instructorName: string;
  status: string;
  enrollmentDate: string;
  fee: number;
}

interface RegistrationSummary {
  studentId: number;
  studentName: string;
  studentEmail: string;
  department: string;
  academicYearLevel: number;
  semester: string;
  academicYear: number;
  totalCredits: number;
  totalFees: number;
  feesPaid: number;
  feesDue: number;
  totalCourses: number;
  registrationStatus: string;
  registrationDate: string;
}

interface Fee {
  id: number;
  feeType: string;
  description: string;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  status: string;
  dueDate: string;
   semester?: string;    
  academicYear?: number;
}

interface PaymentData {
  studentId: number;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  bankName?: string;
  mobileNumber?: string;
  remarks?: string;
  semester: string;
  academicYear: number;
}

// ==================== API Response Types ====================

interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  status: number;
}

type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// ==================== Type Guard ====================

const isSuccessResponse = <T,>(response: ApiResponse<T>): response is ApiSuccessResponse<T> => {
  return response.success === true && 'data' in response;
};

// ==================== Component ====================

const SemesterRegistration: React.FC = () => {
  const { userId, userFullName } = useAuth();
  
  // State
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [registeredCourses, setRegisteredCourses] = useState<RegisteredCourse[]>([]);
  const [summary, setSummary] = useState<RegistrationSummary | null>(null);
  const [studentFees, setStudentFees] = useState<Fee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<string>('FALL');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [registeringCourseId, setRegisteringCourseId] = useState<number | null>(null);
  
  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<string>('BANK_TRANSFER');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  // Constants
  const semesters: string[] = ['FALL', 'SPRING', 'SUMMER'];
  const years: number[] = [2024, 2025, 2026, 2027];
  const FEE_PER_CREDIT: number = 1500;

  // Effects
  useEffect(() => {
    if (userId) {
      fetchAvailableCourses();
      fetchRegisteredCourses();
      fetchRegistrationSummary();
      fetchStudentFees();
    }
  }, [userId, selectedSemester, selectedYear]);

  // Data fetching functions
  const fetchAvailableCourses = async (): Promise<void> => {
    if (!userId) return;
    try {
      const result = await registrationApi.getAvailableCoursesForStudent(
        userId, 
        selectedSemester, 
        selectedYear
      ) as ApiResponse<AvailableCourse[]>;
      
      if (isSuccessResponse(result)) {
        const eligibleCourses = (result.data || []).filter(c => c.isEligible);
        setAvailableCourses(eligibleCourses);
      }
    } catch (error) {
      console.error('Error fetching available courses:', error);
      toast.error('Failed to load available courses');
    }
  };

  const fetchRegisteredCourses = async (): Promise<void> => {
    if (!userId) return;
    try {
      const result = await registrationApi.getStudentRegisteredCourses(
        userId, 
        selectedSemester, 
        selectedYear
      ) as ApiResponse<RegisteredCourse[]>;
      
      if (isSuccessResponse(result)) {
        setRegisteredCourses(Array.isArray(result.data) ? result.data : []);
        const cartItems: CartItem[] = (result.data || []).map(course => ({
          courseId: course.courseId,
          courseCode: course.courseCode,
          courseName: course.courseName,
          credits: course.credits,
          fee: course.fee || course.credits * FEE_PER_CREDIT
        }));
        setCart(cartItems);
      }
    } catch (error) {
      console.error('Error fetching registered courses:', error);
    }
  };

  const fetchRegistrationSummary = async (): Promise<void> => {
    if (!userId) return;
    try {
      const result = await registrationApi.getRegistrationSummary(
        userId, 
        selectedSemester, 
        selectedYear
      ) as ApiResponse<RegistrationSummary>;
      
      if (isSuccessResponse(result)) {
        setSummary(result.data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchStudentFees = async (): Promise<void> => {
    if (!userId) return;
    try {
      const result = await financeApi.getStudentFees(userId) as ApiResponse<Fee[]>;
      if (isSuccessResponse(result)) {
        setStudentFees(result.data);
      }
    } catch (error) {
      console.error('Error fetching student fees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cart functions
  const addToCart = (course: AvailableCourse): void => {
    if (cart.some(item => item.courseId === course.courseId)) {
      toast.error('Course already added to cart');
      return;
    }

    const fee = course.credits * FEE_PER_CREDIT;
    setCart([...cart, {
      courseId: course.courseId,
      courseCode: course.courseCode,
      courseName: course.courseName,
      credits: course.credits,
      fee: fee
    }]);
    toast.success(`${course.courseCode} added to cart`);
  };

  const removeFromCart = (courseId: number): void => {
    setCart(cart.filter(item => item.courseId !== courseId));
    toast.success('Course removed from cart');
  };

  const calculateTotalCredits = (): number => {
    return cart.reduce((sum, item) => sum + item.credits, 0);
  };

  const calculateTotalFees = (): number => {
    return cart.reduce((sum, item) => sum + item.fee, 0);
  };

  // Course registration functions
  const handleRegisterCourse = async (course: AvailableCourse): Promise<void> => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }
    
    if (!course.isEligible) {
      toast.error(course.eligibilityMessage);
      return;
    }

    setIsRegistering(true);
    setRegisteringCourseId(course.courseId);
    
    try {
      const result = await registrationApi.registerCourse({
        studentId: userId,
        courseId: course.courseId,
        semester: selectedSemester,
        academicYear: selectedYear
      }) as ApiResponse<RegisteredCourse>;
      
      if (isSuccessResponse(result)) {
        toast.success(`Successfully registered for ${course.courseCode}!`);
        await fetchRegisteredCourses();
        await fetchAvailableCourses();
        await fetchRegistrationSummary();
        await fetchStudentFees();
      } else if (!result.success && 'message' in result) {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to register for course');
    } finally {
      setIsRegistering(false);
      setRegisteringCourseId(null);
    }
  };

  const handleDropCourse = async (course: RegisteredCourse): Promise<void> => {
    if (!userId) return;
    
    if (!confirm(`Are you sure you want to drop ${course.courseCode}?`)) {
      return;
    }

    try {
      const result = await registrationApi.dropCourse(
        userId,
        course.courseId,
        selectedSemester,
        selectedYear,
        'Student requested drop'
      ) as ApiResponse;
      
      if (result.success) {
        toast.success(`Successfully dropped ${course.courseCode}`);
        await fetchRegisteredCourses();
        await fetchAvailableCourses();
        await fetchRegistrationSummary();
        await fetchStudentFees();
      } else if (!result.success && 'message' in result) {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to drop course');
    }
  };

  // Payment functions - Students only VIEW and PAY, never GENERATE
  // Updated payment functions - Better fee matching
const handleOpenPaymentModal = async (): Promise<void> => {
  if (cart.length === 0) {
    toast.error('Please select at least one course');
    return;
  }

  // Log available fees for debugging
  console.log('Available student fees:', studentFees);
  console.log('Looking for semester:', selectedSemester, 'year:', selectedYear);

  // Find fee record - try multiple matching strategies
  const semesterFee = studentFees.find(fee => {
    // Strategy 1: Exact match in description
    if (fee.description?.includes(selectedSemester) && 
        fee.description?.includes(selectedYear.toString())) {
      return true;
    }
    
    // Strategy 2: Check if fee type is REGISTRATION
    if (fee.feeType === 'REGISTRATION') {
      return true;
    }
    
    // Strategy 3: Check if semester field matches
    if (fee.semester === selectedSemester && fee.academicYear === selectedYear) {
      return true;
    }
    
    return false;
  });
  
  console.log('Found matching fee:', semesterFee);
  
  if (!semesterFee) {
    toast.error('No fee record found. Please contact the finance office.', {
      duration: 5000
    });
    return;
  }
  
  setShowPaymentModal(true);
};
 // Payment functions - Updated to refresh UI after payment
const handleProcessPayment = async (): Promise<void> => {
  if (!userId) return;
  
  if (!paymentReference) {
    toast.error('Please enter payment reference');
    return;
  }

  if (paymentMethod === 'MOBILE_MONEY' && !mobileNumber) {
    toast.error('Please enter mobile number');
    return;
  }

  setIsProcessing(true);
  
  try {
    const paymentData: PaymentData = {
      studentId: userId,
      amount: calculateTotalFees(),
      paymentMethod: paymentMethod,
      referenceNumber: paymentReference,
      remarks: `Payment for ${selectedSemester} ${selectedYear} semester registration`,
      semester: selectedSemester,
      academicYear: selectedYear
    };

    if (paymentMethod === 'BANK_TRANSFER') {
      paymentData.bankName = bankName || 'Commercial Bank of Ethiopia';
    }
    
    if (paymentMethod === 'MOBILE_MONEY') {
      paymentData.mobileNumber = mobileNumber;
    }

    const result = await financeApi.processPayment(paymentData) as ApiResponse;
    
    if (result.success) {
      toast.success('Payment processed successfully!');
      setShowPaymentModal(false);
      resetPaymentForm();
      
      // Refresh ALL data to update UI
      await Promise.all([
        fetchAvailableCourses(),
        fetchRegisteredCourses(),
        fetchRegistrationSummary(),
        fetchStudentFees()
      ]);
      
      // Clear cart after successful payment
      setCart([]);
      
      toast.success('Registration completed! You can now access your courses.');
      
      // Force a re-render by refreshing the page data again after 1 second
      setTimeout(async () => {
        await Promise.all([
          fetchRegistrationSummary(),
          fetchStudentFees()
        ]);
      }, 1000);
      
    } else if (!result.success && 'message' in result) {
      toast.error(result.message);
    } else {
      toast.error('Payment failed. Please try again.');
    }
  } catch (error: any) {
    console.error('Payment error:', error);
    toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
  } finally {
    setIsProcessing(false);
  }
};

  const resetPaymentForm = (): void => {
    setPaymentMethod('BANK_TRANSFER');
    setPaymentReference('');
    setBankName('');
    setMobileNumber('');
    setRemarks('');
  };

  const getRegistrationStatusBadge = (status: string): string => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NOT_STARTED: 'bg-gray-100 text-gray-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const isRegistrationComplete = summary?.registrationStatus === 'PAID' || summary?.registrationStatus === 'COMPLETED';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Semester Registration</h2>
        <p className="text-gray-500">
          Welcome, {userFullName} - Select courses for {selectedSemester} {selectedYear}
        </p>
        {summary && (
          <p className="text-sm text-gray-500 mt-1">
            Department: {summary.department} | Year Level: {summary.academicYearLevel}
          </p>
        )}
      </div>

      {/* Semester Selection */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Select Semester:</span>
          </div>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            disabled={isRegistrationComplete}
          >
            {semesters.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            disabled={isRegistrationComplete}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          
          {summary && (
            <div className="ml-auto">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRegistrationStatusBadge(summary.registrationStatus)}`}>
                Status: {summary.registrationStatus}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Registration Summary Card */}
      {summary && summary.totalCourses > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 mb-6 border border-emerald-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Total Credits</p>
              <p className="text-xl font-bold text-gray-800">{summary.totalCredits}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Courses</p>
              <p className="text-xl font-bold text-gray-800">{summary.totalCourses}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Fees</p>
              <p className="text-xl font-bold text-gray-800">ETB {summary.totalFees.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fees Due</p>
              <p className="text-xl font-bold text-red-600">ETB {summary.feesDue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* No Fee Record Message */}
      {!isRegistrationComplete && studentFees.length === 0 && cart.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mb-6">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-yellow-800">Fee Record Not Found</h3>
          <p className="text-yellow-600 mt-2">
            No fee record has been generated for {selectedSemester} {selectedYear} yet.
          </p>
          <p className="text-sm text-yellow-500 mt-1">
            Please contact the finance office to generate your fee record.
          </p>
        </div>
      )}

      {/* Registration Complete State */}
      {isRegistrationComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-800">Registration Complete!</h3>
          <p className="text-green-600 mt-2">
            You are successfully registered for {selectedSemester} {selectedYear}.
            Total: {summary?.totalCredits || 0} credits | ETB {(summary?.totalFees || 0).toLocaleString()}
          </p>
        </div>
      )}

      {/* Main Registration Interface */}
      {!isRegistrationComplete && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Courses - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Available Courses</h3>
                <p className="text-sm text-gray-500">
                  Courses for {selectedSemester} {selectedYear} - Showing {availableCourses.length} available
                </p>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {availableCourses.map((course) => {
                  const isInCart = cart.some(item => item.courseId === course.courseId);
                  const isRegistered = registeredCourses.some(rc => rc.courseId === course.courseId);
                  
                  return (
                    <div key={course.courseId} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-emerald-500" />
                            <span className="font-mono text-sm text-emerald-600">{course.courseCode}</span>
                          </div>
                          <h4 className="font-medium text-gray-800 mt-1">{course.courseName}</h4>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                            <span>Credits: {course.credits}</span>
                            <span>Fee: ETB {(course.credits * FEE_PER_CREDIT).toLocaleString()}</span>
                            <span>Schedule: {course.schedule || 'TBA'}</span>
                            <span>Instructor: {course.instructorName || 'TBA'}</span>
                            <span>Seats: {course.availableSeats} left</span>
                          </div>
                          {course.prerequisites && (
                            <p className="text-xs text-gray-400 mt-1">Prerequisites: {course.prerequisites}</p>
                          )}
                        </div>
                        {isRegistered ? (
                          <span className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg">
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            Registered
                          </span>
                        ) : isInCart ? (
                          <button
                            onClick={() => removeFromCart(course.courseId)}
                            className="flex items-center px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => addToCart(course)}
                            disabled={!course.isEligible}
                            className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition ${
                              course.isEligible
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isRegistering && registeringCourseId === course.courseId ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                            ) : (
                              <Plus className="w-4 h-4 mr-1" />
                            )}
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {availableCourses.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No courses available for this semester.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cart - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-4">
              <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="flex items-center">
                  <ShoppingCart className="w-5 h-5 text-emerald-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Registration Cart</h3>
                </div>
                {summary?.registrationStatus === 'PENDING' && (
                  <p className="text-xs text-yellow-600 mt-1">Payment required to complete registration</p>
                )}
              </div>
              
              <div className="p-4 max-h-96 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>Your cart is empty</p>
                    <p className="text-sm">Add courses to continue</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.courseId} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-mono text-sm text-emerald-600">{item.courseCode}</p>
                          <p className="text-sm text-gray-800">{item.courseName}</p>
                          <p className="text-xs text-gray-500">{item.credits} credits</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">ETB {item.fee.toLocaleString()}</p>
                          <button
                            onClick={() => removeFromCart(item.courseId)}
                            className="text-red-500 hover:text-red-700 text-xs mt-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-gray-50">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Credits:</span>
                    <span className="font-semibold">{calculateTotalCredits()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee per Credit:</span>
                    <span>ETB {FEE_PER_CREDIT.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-lg font-bold text-gray-800">Total Fees:</span>
                    <span className="text-lg font-bold text-emerald-600">
                      ETB {calculateTotalFees().toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleOpenPaymentModal}
                  disabled={cart.length === 0 || studentFees.length === 0}
                  className="w-full mt-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Now
                </button>
                
                {studentFees.length === 0 && cart.length > 0 && (
                  <p className="text-xs text-red-500 text-center mt-2">
                    No fee record found. Please contact finance office.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">Make Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Amount Due</p>
                <p className="text-2xl font-bold text-emerald-600">ETB {calculateTotalFees().toLocaleString()}</p>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`p-3 border rounded-lg flex items-center justify-center space-x-2 transition ${
                      paymentMethod === 'BANK_TRANSFER' 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm">Bank Transfer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MOBILE_MONEY')}
                    className={`p-3 border rounded-lg flex items-center justify-center space-x-2 transition ${
                      paymentMethod === 'MOBILE_MONEY' 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="text-sm">Mobile Money</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 border rounded-lg flex items-center justify-center space-x-2 transition ${
                      paymentMethod === 'CARD' 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-3 border rounded-lg flex items-center justify-center space-x-2 transition ${
                      paymentMethod === 'CASH' 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span className="text-sm">Cash</span>
                  </button>
                </div>
              </div>

              {/* Payment Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {paymentMethod === 'MOBILE_MONEY' ? 'Transaction Reference' : 'Reference Number'} *
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder={paymentMethod === 'MOBILE_MONEY' ? 'Enter transaction ID from your mobile' : 'Enter transaction reference number'}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Bank Name (for bank transfer) */}
              {paymentMethod === 'BANK_TRANSFER' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Bank</option>
                    <option value="Commercial Bank of Ethiopia">Commercial Bank of Ethiopia</option>
                    <option value="Dashen Bank">Dashen Bank</option>
                    <option value="Awash Bank">Awash Bank</option>
                    <option value="Abyssinia Bank">Abyssinia Bank</option>
                    <option value="United Bank">United Bank</option>
                  </select>
                </div>
              )}

              {/* Mobile Number (for mobile money) */}
              {paymentMethod === 'MOBILE_MONEY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="0912345678"
                    maxLength={10}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter 10-digit phone number</p>
                </div>
              )}

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> After payment confirmation, your registration will be completed.
                </p>
              </div>

              <button
                onClick={handleProcessPayment}
                disabled={isProcessing || !paymentReference || (paymentMethod === 'MOBILE_MONEY' && !mobileNumber)}
                className="w-full py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4 mr-2" />
                    Pay ETB {calculateTotalFees().toLocaleString()}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemesterRegistration;