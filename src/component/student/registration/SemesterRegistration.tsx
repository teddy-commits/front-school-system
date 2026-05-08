import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { courseApi } from '../../../api/modules/courseApi';
import { semesterRegistrationApi } from '../../../api/modules/semesterRegistrationApi';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  TrendingUp,
  X,
  ShoppingCart
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  credits: number;
  department: string;
  schedule: string;
  instructorName: string;
  hasAvailableSeats: boolean;
}

interface CartItem {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  fee: number;
}

const SemesterRegistration: React.FC = () => {
  const { userId } = useAuth();
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentRegistration, setCurrentRegistration] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('FALL');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [canRegister, setCanRegister] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const semesters = ['FALL', 'SPRING', 'SUMMER'];
  const years = [2024, 2025, 2026];

  const FEE_PER_CREDIT = 1500; // $1500 per credit hour

  useEffect(() => {
    if (userId) {
      checkRegistrationStatus();
      fetchAvailableCourses();
      fetchCurrentRegistration();
    }
  }, [userId, selectedSemester, selectedYear]);

  const checkRegistrationStatus = async () => {
    const result = await semesterRegistrationApi.canRegister(userId!, selectedSemester, selectedYear);
    if (result.success) {
      setCanRegister(result.data.canRegister);
    }
  };

  const fetchAvailableCourses = async () => {
    const result = await courseApi.getAllCourses();
    if (result.success) {
      // Filter courses that are open for registration
      const openCourses = result.data.filter((c: any) => c.status === 'OPEN');
      setAvailableCourses(openCourses);
    }
  };

  const fetchCurrentRegistration = async () => {
    setIsLoading(true);
    const result = await semesterRegistrationApi.getCurrentRegistration(userId!);
    if (result.success && result.data) {
      setCurrentRegistration(result.data);
      // Load existing cart items
      if (result.data.courses) {
        const cartItems = result.data.courses.map((c: any) => ({
          courseId: c.courseId,
          courseCode: c.courseCode,
          courseName: c.courseName,
          credits: c.credits,
          fee: c.fee
        }));
        setCart(cartItems);
      }
    }
    setIsLoading(false);
  };

  const addToCart = (course: Course) => {
    if (cart.some(item => item.courseId === course.id)) {
      toast.error('Course already added to cart');
      return;
    }

    const fee = course.credits * FEE_PER_CREDIT;
    setCart([...cart, {
      courseId: course.id,
      courseCode: course.courseCode,
      courseName: course.courseName,
      credits: course.credits,
      fee: fee
    }]);
    toast.success(`${course.courseCode} added to cart`);
  };

  const removeFromCart = (courseId: number) => {
    setCart(cart.filter(item => item.courseId !== courseId));
    toast.success('Course removed from cart');
  };

  const calculateTotalCredits = () => {
    return cart.reduce((sum, item) => sum + item.credits, 0);
  };

  const calculateTotalFees = () => {
    return cart.reduce((sum, item) => sum + item.fee, 0);
  };

  const handleInitiateRegistration = async () => {
    if (cart.length === 0) {
      toast.error('Please select at least one course');
      return;
    }

    setIsProcessing(true);
    const result = await semesterRegistrationApi.initiateRegistration({
      studentId: userId!,
      semester: selectedSemester,
      academicYear: selectedYear,
      courseIds: cart.map(item => item.courseId)
    });

    if (result.success) {
      setCurrentRegistration(result.data);
      toast.success('Registration initiated successfully!');
      fetchCurrentRegistration();
    } else {
      toast.error(result.message);
    }
    setIsProcessing(false);
  };

  const handleCompleteRegistration = async () => {
    if (!currentRegistration) {
      toast.error('No active registration found');
      return;
    }

    setIsProcessing(true);
    const result = await semesterRegistrationApi.completeRegistration(currentRegistration.id);
    if (result.success) {
      setCurrentRegistration(result.data);
      toast.success('Registration completed! Please proceed to payment.');
      setShowPaymentModal(true);
    } else {
      toast.error(result.message);
    }
    setIsProcessing(false);
  };

  const handlePayment = async () => {
    if (!paymentReference) {
      toast.error('Please enter payment reference');
      return;
    }

    setIsProcessing(true);
    const result = await semesterRegistrationApi.processPayment(
      currentRegistration.id,
      paymentReference,
      calculateTotalFees()
    );

    if (result.success) {
      setCurrentRegistration(result.data);
      toast.success('Payment processed successfully!');
      setShowPaymentModal(false);
      fetchCurrentRegistration();
    } else {
      toast.error(result.message);
    }
    setIsProcessing(false);
  };

  const getRegistrationStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Semester Registration</h2>
        <p className="text-gray-500">Select courses for the upcoming semester</p>
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
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={currentRegistration && currentRegistration.status !== 'PAID'}
          >
            {semesters.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={currentRegistration && currentRegistration.status !== 'PAID'}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          
          {currentRegistration && currentRegistration.status !== 'PAID' && (
            <div className="ml-auto">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRegistrationStatusBadge(currentRegistration.status)}`}>
                Status: {currentRegistration.status}
              </span>
            </div>
          )}
        </div>
      </div>

      {!canRegister && !currentRegistration && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-yellow-800">Registration Not Available</h3>
          <p className="text-yellow-600 mt-2">
            You cannot register for {selectedSemester} {selectedYear} at this time.
            Please check the registration schedule or contact the academic office.
          </p>
        </div>
      )}

      {currentRegistration && currentRegistration.status === 'PAID' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-800">Registration Complete!</h3>
          <p className="text-green-600 mt-2">
            You are successfully registered for {currentRegistration.semester} {currentRegistration.academicYear}.
            Total: {currentRegistration.totalCredits} credits | ${currentRegistration.totalFees.toLocaleString()}
          </p>
        </div>
      )}

      {(!currentRegistration || currentRegistration.status === 'PENDING') && canRegister && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Available Courses</h3>
                <p className="text-sm text-gray-500">Select courses to register</p>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {availableCourses.map((course) => (
                  <div key={course.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          <span className="font-mono text-sm text-blue-600">{course.courseCode}</span>
                        </div>
                        <h4 className="font-medium text-gray-800 mt-1">{course.courseName}</h4>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                          <span>Credits: {course.credits}</span>
                          <span>Fee: ${(course.credits * FEE_PER_CREDIT).toLocaleString()}</span>
                          <span>Schedule: {course.schedule || 'TBA'}</span>
                          <span>Instructor: {course.instructorName || 'TBA'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(course)}
                        disabled={!course.hasAvailableSeats}
                        className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </button>
                    </div>
                  </div>
                ))}
                {availableCourses.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No courses available for this semester.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cart / Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-4">
              <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center">
                  <ShoppingCart className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Registration Cart</h3>
                </div>
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
                          <p className="font-mono text-sm text-blue-600">{item.courseCode}</p>
                          <p className="text-sm text-gray-800">{item.courseName}</p>
                          <p className="text-xs text-gray-500">{item.credits} credits</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">${item.fee.toLocaleString()}</p>
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
                    <span>${FEE_PER_CREDIT.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-lg font-bold text-gray-800">Total Fees:</span>
                    <span className="text-lg font-bold text-blue-600">
                      ${calculateTotalFees().toLocaleString()}
                    </span>
                  </div>
                </div>

                {!currentRegistration && (
                  <button
                    onClick={handleInitiateRegistration}
                    disabled={cart.length === 0 || isProcessing}
                    className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Proceed to Registration'}
                  </button>
                )}

                {currentRegistration && currentRegistration.status === 'PENDING' && (
                  <button
                    onClick={handleCompleteRegistration}
                    disabled={isProcessing}
                    className="w-full mt-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Complete Registration'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Process Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Amount Due</p>
                <p className="text-2xl font-bold text-blue-600">${calculateTotalFees().toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference</label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Enter transaction reference number"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Reference from bank transfer or mobile payment</p>
              </div>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemesterRegistration;