// ============================================
// API Configuration & Types
// ============================================

const API_URL = 'http://localhost:8080/api/v1';
const UPLOADS_URL = 'http://localhost:8080/uploads';

// ============================================
// Helper Functions
// ============================================

/**
 * Get full URL for avatar/uploaded files
 * @param path - Relative path from backend (e.g., 'avatars/EMP001/xxx.jpg')
 * @returns Full URL or undefined if path is empty
 */
export const getUploadUrl = (path?: string): string | undefined => {
  if (!path) return undefined;
  // If already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${UPLOADS_URL}/${cleanPath}`;
};

// ============================================
// Response Types (Based on backend response.go)
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ErrorDetail;
  meta?: Meta;
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface Meta {
  page?: number;
  limit?: number;
  total_items?: number;
  total_pages?: number;
}

// Error codes based on backend error.go
export type ErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_SERVER_ERROR';

// ============================================
// Auth DTOs (Based on backend auth/dto.go)
// ============================================

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginEmployeeCodeRequest {
  company_username: string;
  employee_code: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface TokenResponse {
  access_token: string;
  access_token_expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
}

export interface AccessTokenResponse {
  access_token: string;
  access_token_expires_in: number;
}

// ============================================
// Company DTOs
// ============================================

export interface Company {
  id: string;
  name: string;
  username: string;
  address?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyRequest {
  company_name: string;
  company_username: string;
  company_address?: string;
  attachment?: File; // Optional company logo file
}

export interface UpdateCompanyRequest {
  name?: string;
  address?: string;
  logo_url?: string;
}

// ============================================
// Employee DTOs (Based on backend employee/dto.go)
// ============================================

export interface Employee {
  id: string;
  user_id?: string;
  company_id: string;
  work_schedule_id?: string;
  position_id: string;
  grade_id?: string;
  branch_id?: string;
  employee_code: string;
  full_name: string;
  nik?: string;
  gender: 'Male' | 'Female';
  phone_number: string;
  address?: string;
  place_of_birth?: string;
  dob?: string;
  avatar_url?: string;
  education?: string;
  hire_date: string;
  resignation_date?: string;
  employment_type: 'permanent' | 'probation' | 'contract' | 'internship' | 'freelance';
  employment_status: 'active' | 'inactive';
  warning_letter?: string;
  bank_name?: string;
  bank_account_holder_name?: string;
  bank_account_number?: string;
  base_salary?: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeeWithDetails extends Employee {
  position_name?: string;
  grade_name?: string;
  branch_name?: string;
  work_schedule_name?: string;
  invitation_status?: string;
}

export interface CreateEmployeeRequest {
  work_schedule_id: string;
  position_id: string;
  grade_id: string;
  branch_id?: string;
  employee_code: string;
  full_name: string;
  email: string;
  role?: 'employee' | 'manager';
  nik?: string;
  gender: 'Male' | 'Female';
  phone_number: string;
  address?: string;
  place_of_birth?: string;
  dob?: string;
  education?: string;
  hire_date: string;
  employment_type: 'permanent' | 'probation' | 'contract' | 'internship' | 'freelance';
  warning_letter?: string;
  bank_name?: string;
  bank_account_holder_name?: string;
  bank_account_number?: string;
  base_salary?: number;
}

export interface UpdateEmployeeRequest {
  work_schedule_id?: string;
  position_id?: string;
  grade_id?: string;
  branch_id?: string;
  employee_code?: string;
  full_name?: string;
  nik?: string;
  gender?: 'Male' | 'Female';
  phone_number?: string;
  address?: string;
  place_of_birth?: string;
  dob?: string;
  education?: string;
  hire_date?: string;
  employment_type?: string;
  warning_letter?: string;
  bank_name?: string;
  bank_account_holder_name?: string;
  bank_account_number?: string;
  base_salary?: number;
}

export interface EmployeeFilter {
  search?: string;
  position_id?: string;
  branch_id?: string;
  grade_id?: string;
  employment_status?: string;
  employment_type?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ============================================
// Leave DTOs
// ============================================

export interface LeaveType {
  id: string;
  company_id: string;
  code?: string;
  name: string;
  description?: string;
  color?: string;
  is_active?: boolean;
  requires_approval?: boolean;
  has_quota?: boolean;
  accrual_method?: string;
  quota_calculation_type: string;
  quota_rules: QuotaRules;
}

export interface QuotaRules {
  type: string;
  default_quota: number;
  rules?: QuotaRule[];
}

export interface QuotaRule {
  quota: number;
  position_id?: string;
  grade_id?: string;
  employment_type?: string;
  min_months?: number;
  max_months?: number;
  conditions?: {
    min_tenure_months?: number;
    max_tenure_months?: number;
    position_id?: string;
    grade_id?: string;
    employment_type?: string;
  };
}

export interface LeaveQuota {
  id: string;
  employee_id: string;
  leave_type_id: string;
  leave_type_name?: string;
  year: number;
  opening_balance: number;
  earned_quota: number;
  rollover_quota: number;
  adjustment_quota: number;
  used_quota: number;
  pending_quota: number;
  available_quota: number;
  rollover_expiry_date?: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type_id: string;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  duration_type: string;
  total_days: number;
  working_days: number;
  reason: string;
  attachment_url?: string;
  status: 'waiting_approval' | 'approved' | 'rejected' | 'cancelled';
  submitted_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface LeaveRequestFilter {
  employee_id?: string;
  employee_name?: string;
  leave_type_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
}

export interface ListLeaveRequestResponse {
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  showing: string;
  requests: LeaveRequest[];
}

export interface CreateLeaveTypeRequest {
  name: string;
  code?: string;
  description?: string;
  color?: string;
  is_active?: boolean;
  requires_approval?: boolean;
  requires_attachment?: boolean;
  attachment_required_after_days?: number;
  has_quota?: boolean;
  accrual_method?: string;
  deduction_type?: string;
  allow_half_day?: boolean;
  max_days_per_request?: number;
  min_notice_days?: number;
  max_advance_days?: number;
  allow_backdate?: boolean;
  backdate_max_days?: number;
  allow_rollover?: boolean;
  max_rollover_days?: number;
  rollover_expiry_month?: number;
  quota_calculation_type: string;
  quota_rules: Record<string, unknown>;
}

export interface CreateLeaveRequestPayload {
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  duration_type: string; // 'full_day', 'half_day_morning', 'half_day_afternoon'
  reason: string;
}

// ============================================
// Master Data DTOs (Branch, Grade, Position)
// ============================================

export interface Branch {
  id: string;
  company_id: string;
  name: string;
  address?: string;
  timezone?: string;
  created_at: string;
  updated_at: string;
}

export interface Grade {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBranchRequest {
  name: string;
  address?: string;
  timezone?: string;
}

export interface CreateGradeRequest {
  name: string;
  description?: string;
}

export interface CreatePositionRequest {
  name: string;
  description?: string;
}

// ============================================
// Schedule DTOs
// ============================================

export interface WorkSchedule {
  id: string;
  company_id: string;
  name: string;
  type: 'WFO' | 'Hybrid';
  description?: string;
  times?: WorkScheduleTime[];
  locations?: WorkScheduleLocation[];
  created_at: string;
  updated_at: string;
}

export interface WorkScheduleTime {
  id: string;
  work_schedule_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_off_day: boolean;
}

export interface WorkScheduleLocation {
  id: string;
  work_schedule_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
}

export interface EmployeeScheduleAssignment {
  id: string;
  employee_id: string;
  work_schedule_id: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Attendance DTOs
// ============================================

export interface Attendance {
  id: string;
  employee_id: string;
  work_schedule_id: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  clock_in_latitude?: number;
  clock_in_longitude?: number;
  clock_out_latitude?: number;
  clock_out_longitude?: number;
  status: 'present' | 'late' | 'absent' | 'waiting_approval';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ClockInRequest {
  latitude: number;
  longitude: number;
  notes?: string;
}

export interface ClockOutRequest {
  latitude: number;
  longitude: number;
  notes?: string;
}

export interface AttendanceFilter {
  employee_id?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// ============================================
// Invitation DTOs
// ============================================

export interface Invitation {
  id: string;
  company_id: string;
  company_name?: string;
  employee_id: string;
  email: string;
  token: string;
  role?: 'employee' | 'manager';
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Payroll DTOs
// ============================================

export interface PayrollSettings {
  id: string;
  company_id: string;
  late_deduction_enabled: boolean;
  late_deduction_per_minute: string;
  overtime_enabled: boolean;
  overtime_pay_per_minute: string;
  early_leave_deduction_enabled: boolean;
  early_leave_deduction_per_minute: string;
}

export interface UpdatePayrollSettingsRequest {
  late_deduction_enabled?: boolean;
  late_deduction_per_minute?: string;
  overtime_enabled?: boolean;
  overtime_pay_per_minute?: string;
  early_leave_deduction_enabled?: boolean;
  early_leave_deduction_per_minute?: string;
}

export interface PayrollComponent {
  id: string;
  company_id: string;
  name: string;
  type: 'allowance' | 'deduction';
  description?: string;
  is_taxable: boolean;
  is_active: boolean;
}

export interface CreatePayrollComponentRequest {
  name: string;
  type: 'allowance' | 'deduction';
  description?: string;
  is_taxable?: boolean;
}

export interface EmployeePayrollComponent {
  id: string;
  employee_id: string;
  payroll_component_id: string;
  component_name: string;
  component_type: string;
  amount: string;
  effective_date: string;
  end_date?: string;
}

export interface AssignComponentRequest {
  payroll_component_id: string;
  amount: string;
  effective_date?: string;
  end_date?: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  position_name?: string;
  branch_name?: string;
  period_month: number;
  period_year: number;
  base_salary: string;
  total_allowances: string;
  total_deductions: string;
  allowances_detail?: Record<string, string>;
  deductions_detail?: Record<string, string>;
  total_work_days: number;
  total_late_minutes: number;
  late_deduction_amount: string;
  total_early_leave_minutes: number;
  early_leave_deduction_amount: string;
  total_overtime_minutes: number;
  overtime_amount: string;
  gross_salary: string;
  net_salary: string;
  status: 'draft' | 'paid';
  paid_at?: string;
  notes?: string;
}

export interface GeneratePayrollRequest {
  period_month: number;
  period_year: number;
  employee_ids?: string[];
}

export interface FinalizePayrollRequest {
  record_ids: string[];
}

export interface PayrollFilter {
  period_month?: number;
  period_year?: number;
  status?: string;
  employee_id?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
}

export interface ListPayrollRecordResponse {
  data: PayrollRecord[];
  total_count: number;
  page: number;
  limit: number;
}

export interface PayrollSummary {
  period_month: number;
  period_year: number;
  total_employees: number;
  total_base_salary: string;
  total_allowances: string;
  total_deductions: string;
  total_late_deduction: string;
  total_overtime: string;
  total_gross_salary: string;
  total_net_salary: string;
  draft_count: number;
  paid_count: number;
}

// ============================================
// Dashboard DTOs
// ============================================

export interface DashboardData {
  total_employees: number;
  active_employees: number;
  attendance_today: number;
  pending_leave_requests: number;
}

export interface EmployeeStatusStats {
  permanent: number;
  probation: number;
  contract: number;
  internship: number;
}

export interface DailyAttendanceStats {
  on_time: number;
  late: number;
  absent: number;
  sick: number;
}

// ============================================
// Token Management
// ============================================

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const ACCESS_TOKEN_EXPIRES_KEY = 'access_token_expires_at';

// Token state management (in-memory for quick access)
let accessToken: string | null = null;
let accessTokenExpiresAt: number | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Token error messages from backend (error.go)
const TOKEN_ERROR_MESSAGES = [
  'invalid or expired token',
  'token has expired',
  'Token expired',
  'Invalid or expired token',
];

// Initialize tokens from localStorage (for page refresh persistence)
export function initializeTokens(): void {
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const expiresAt = localStorage.getItem(ACCESS_TOKEN_EXPIRES_KEY);
    accessTokenExpiresAt = expiresAt ? parseInt(expiresAt, 10) : null;
  }
}

// Get current access token
export function getAccessToken(): string | null {
  return accessToken;
}

// Set access token (call after login/register/refresh)
export function setAccessToken(token: string, expiresIn: number): void {
  accessToken = token;
  // Convert expires_in (seconds) to timestamp
  accessTokenExpiresAt = Math.floor(Date.now() / 1000) + expiresIn;

  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(ACCESS_TOKEN_EXPIRES_KEY, accessTokenExpiresAt.toString());
  }
}

// Clear tokens (call on logout)
export function clearTokens(): void {
  accessToken = null;
  accessTokenExpiresAt = null;

  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_EXPIRES_KEY);
  }
}

// Check if access token is expired or about to expire (within 30 seconds)
export function isAccessTokenExpired(): boolean {
  if (!accessToken || !accessTokenExpiresAt) return true;
  const now = Math.floor(Date.now() / 1000);
  // Consider token expired if it expires within 30 seconds
  return now >= accessTokenExpiresAt - 30;
}

// Subscribe to token refresh
function subscribeToTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback);
}

// Notify all subscribers after token refresh
function onTokenRefreshed(newToken: string): void {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

// Refresh the access token using refresh token cookie
async function refreshAccessToken(): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include refresh_token cookie
    });

    const data: ApiResponse<AccessTokenResponse> = await response.json();

    if (!response.ok || !data.success || !data.data) {
      throw new Error(data.error?.message || 'Failed to refresh token');
    }

    // Update stored token
    setAccessToken(data.data.access_token, data.data.access_token_expires_in);
    return data.data.access_token;
  } catch (error) {
    // Clear tokens on refresh failure
    clearTokens();
    throw error;
  }
}

// Check if error is a token error
function isTokenError(error: ApiError): boolean {
  if (error.statusCode === 401) {
    const message = error.errorDetail.message.toLowerCase();
    return TOKEN_ERROR_MESSAGES.some((msg) => message.includes(msg.toLowerCase()));
  }
  return false;
}

// ============================================
// API Helper Functions
// ============================================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorDetail: ErrorDetail
  ) {
    super(errorDetail.message);
    this.name = 'ApiError';
  }

  // Check if this is an authentication error
  isAuthError(): boolean {
    return this.statusCode === 401;
  }

  // Check if this is a token expired error
  isTokenExpired(): boolean {
    return isTokenError(this);
  }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(response.status, data.error || {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    });
  }

  return data;
}

function getAuthHeaders(): HeadersInit {
  const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null);
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Authenticated fetch with automatic token refresh
async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<ApiResponse<T>> {
  // Check if token is expired before making request
  if (isAccessTokenExpired() && retry) {
    // Token is expired, try to refresh first
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        onTokenRefreshed(newToken);
      } catch (error) {
        isRefreshing = false;
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
        throw error;
      }
    } else {
      // Wait for ongoing refresh to complete
      await new Promise<string>((resolve) => {
        subscribeToTokenRefresh(resolve);
      });
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
    credentials: 'include',
  });

  try {
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      const error = new ApiError(response.status, data.error || {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
      });

      // If token error and we haven't retried yet, refresh token and retry
      if (isTokenError(error) && retry) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const newToken = await refreshAccessToken();
            isRefreshing = false;
            onTokenRefreshed(newToken);
            // Retry the request with new token
            return fetchWithAuth<T>(url, options, false);
          } catch (refreshError) {
            isRefreshing = false;
            // Refresh failed, redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/auth';
            }
            throw refreshError;
          }
        } else {
          // Wait for ongoing refresh, then retry
          await new Promise<string>((resolve) => {
            subscribeToTokenRefresh(resolve);
          });
          return fetchWithAuth<T>(url, options, false);
        }
      }

      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(response.status, {
      code: 'PARSE_ERROR',
      message: 'Failed to parse response',
    });
  }
}

// ============================================
// Auth API
// ============================================

export const authApi = {
  register: async (data: RegisterRequest): Promise<ApiResponse<TokenResponse>> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return handleResponse<TokenResponse>(response);
  },

  login: async (data: LoginRequest): Promise<ApiResponse<TokenResponse>> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return handleResponse<TokenResponse>(response);
  },

  loginWithEmployeeCode: async (data: LoginEmployeeCodeRequest): Promise<ApiResponse<TokenResponse>> => {
    const response = await fetch(`${API_URL}/auth/login/employee-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return handleResponse<TokenResponse>(response);
  },

  loginWithGoogle: (): void => {
    window.location.href = `${API_URL}/auth/login/oauth/google`;
  },

  logout: async (): Promise<ApiResponse<string>> => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<string>(response);
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<ApiResponse<AccessTokenResponse>> => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return handleResponse<AccessTokenResponse>(response);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<null>(response);
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<null>(response);
  },
};

// ============================================
// Company API
// ============================================

export const companyApi = {
  create: async (data: CreateCompanyRequest): Promise<ApiResponse<Company>> => {
    const formData = new FormData();
    
    // Create JSON data object (without file)
    const jsonData = {
      company_name: data.company_name,
      company_username: data.company_username,
      ...(data.company_address && { company_address: data.company_address }),
    };
    
    formData.append('data', JSON.stringify(jsonData));
    
    // Add attachment file if provided
    if (data.attachment) {
      formData.append('attachment', data.attachment);
    }
    
    const token = getAccessToken();
    const response = await fetch(`${API_URL}/company`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      credentials: 'include',
    });
    return handleResponse<Company>(response);
  },

  getMyCompany: async (): Promise<ApiResponse<Company>> => {
    return fetchWithAuth<Company>(`${API_URL}/company/my`, {
      method: 'GET',
    });
  },

  update: async (data: UpdateCompanyRequest): Promise<ApiResponse<Company>> => {
    return fetchWithAuth<Company>(`${API_URL}/company/my`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/company/my`, {
      method: 'DELETE',
    });
  },

  uploadLogo: async (file: File): Promise<ApiResponse<{ logo_url: string }>> => {
    const formData = new FormData();
    formData.append('logo', file);

    const token = getAccessToken();
    const response = await fetch(`${API_URL}/company/my/logo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      credentials: 'include',
    });
    return handleResponse<{ logo_url: string }>(response);
  },
};

// ============================================
// Employee API
// ============================================

export const employeeApi = {
  list: async (filter?: EmployeeFilter): Promise<ApiResponse<EmployeeWithDetails[]>> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return fetchWithAuth<EmployeeWithDetails[]>(`${API_URL}/employees?${params}`, {
      method: 'GET',
    });
  },

  get: async (id: string): Promise<ApiResponse<EmployeeWithDetails>> => {
    return fetchWithAuth<EmployeeWithDetails>(`${API_URL}/employees/${id}`, {
      method: 'GET',
    });
  },

  search: async (query: string): Promise<ApiResponse<EmployeeWithDetails[]>> => {
    return fetchWithAuth<EmployeeWithDetails[]>(`${API_URL}/employees/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
  },

  create: async (data: CreateEmployeeRequest, avatar?: File): Promise<ApiResponse<Employee>> => {
    const token = getAccessToken();
    
    // Clean data: remove empty strings for optional fields (backend expects null/undefined, not empty string for UUID)
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => {
        // Keep required fields and non-empty optional fields
        const requiredFields = ['work_schedule_id', 'position_id', 'grade_id', 'employee_code', 'full_name', 'email', 'gender', 'phone_number', 'hire_date', 'employment_type'];
        if (requiredFields.includes(key)) return true;
        // For optional fields, only include if value is not empty string
        return value !== '' && value !== null && value !== undefined;
      })
    );
    
    // If avatar is provided, use FormData with 'data' key for JSON and 'avatar' key for file
    if (avatar) {
      const formData = new FormData();
      formData.append('data', JSON.stringify(cleanData));
      formData.append('avatar', avatar);

      const response = await fetch(`${API_URL}/employees`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        credentials: 'include',
      });
      return handleResponse<Employee>(response);
    }
    
    // If no avatar, send as regular JSON
    return fetchWithAuth<Employee>(`${API_URL}/employees`, {
      method: 'POST',
      body: JSON.stringify(cleanData),
    });
  },

  update: async (id: string, data: UpdateEmployeeRequest): Promise<ApiResponse<Employee>> => {
    return fetchWithAuth<Employee>(`${API_URL}/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/employees/${id}`, {
      method: 'DELETE',
    });
  },

  inactivate: async (id: string, resignationDate: string): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/employees/${id}/inactivate`, {
      method: 'POST',
      body: JSON.stringify({ resignation_date: resignationDate }),
    });
  },

  uploadAvatar: async (id: string, file: File): Promise<ApiResponse<{ avatar_url: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = getAccessToken();
    const response = await fetch(`${API_URL}/employees/${id}/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      credentials: 'include',
    });
    return handleResponse<{ avatar_url: string }>(response);
  },

  resendInvitation: async (id: string): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/employees/${id}/invitation/resend`, {
      method: 'POST',
    });
  },

  revokeInvitation: async (id: string): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/employees/${id}/invitation/revoke`, {
      method: 'POST',
    });
  },
};

// ============================================
// Leave API
// ============================================

export const leaveApi = {
  // Leave Types
  listTypes: async (): Promise<ApiResponse<LeaveType[]>> => {
    return fetchWithAuth<LeaveType[]>(`${API_URL}/leave/types`, {
      method: 'GET',
    });
  },

  createType: async (data: CreateLeaveTypeRequest): Promise<ApiResponse<LeaveType>> => {
    return fetchWithAuth<LeaveType>(`${API_URL}/leave/types`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateType: async (id: string, data: Partial<CreateLeaveTypeRequest>): Promise<ApiResponse<LeaveType>> => {
    return fetchWithAuth<LeaveType>(`${API_URL}/leave/types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteType: async (id: string): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/leave/types/${id}`, {
      method: 'DELETE',
    });
  },

  // Leave Quota
  listQuota: async (): Promise<ApiResponse<LeaveQuota[]>> => {
    return fetchWithAuth<LeaveQuota[]>(`${API_URL}/leave/quota`, {
      method: 'GET',
    });
  },

  getQuota: async (id: string): Promise<ApiResponse<LeaveQuota>> => {
    return fetchWithAuth<LeaveQuota>(`${API_URL}/leave/quota/${id}`, {
      method: 'GET',
    });
  },

  getMyQuota: async (): Promise<ApiResponse<LeaveQuota[]>> => {
    return fetchWithAuth<LeaveQuota[]>(`${API_URL}/leave/quota/my`, {
      method: 'GET',
    });
  },

  adjustQuota: async (data: { employee_id: string; leave_type_id: string; adjustment: number; reason: string }): Promise<ApiResponse<LeaveQuota>> => {
    return fetchWithAuth<LeaveQuota>(`${API_URL}/leave/quota/adjust`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Leave Requests
  listRequests: async (filter?: LeaveRequestFilter): Promise<ApiResponse<ListLeaveRequestResponse>> => {
    const params = new URLSearchParams();
    if (filter) {
      if (filter.employee_id) params.append('employee_id', filter.employee_id);
      if (filter.employee_name) params.append('employee_name', filter.employee_name);
      if (filter.leave_type_id) params.append('leave_type_id', filter.leave_type_id);
      if (filter.status) params.append('status', filter.status);
      if (filter.start_date) params.append('start_date', filter.start_date);
      if (filter.end_date) params.append('end_date', filter.end_date);
      if (filter.page) params.append('page', String(filter.page));
      if (filter.limit) params.append('limit', String(filter.limit));
      if (filter.sort_by) params.append('sort_by', filter.sort_by);
      if (filter.sort_order) params.append('sort_order', filter.sort_order);
    }
    return fetchWithAuth<ListLeaveRequestResponse>(`${API_URL}/leave/requests?${params}`, {
      method: 'GET',
    });
  },

  getRequest: async (id: string): Promise<ApiResponse<LeaveRequest>> => {
    return fetchWithAuth<LeaveRequest>(`${API_URL}/leave/requests/${id}`, {
      method: 'GET',
    });
  },

  getMyRequests: async (filter?: LeaveRequestFilter): Promise<ApiResponse<ListLeaveRequestResponse>> => {
    const params = new URLSearchParams();
    if (filter) {
      if (filter.leave_type_id) params.append('leave_type_id', filter.leave_type_id);
      if (filter.status) params.append('status', filter.status);
      if (filter.start_date) params.append('start_date', filter.start_date);
      if (filter.end_date) params.append('end_date', filter.end_date);
      if (filter.page) params.append('page', String(filter.page));
      if (filter.limit) params.append('limit', String(filter.limit));
      if (filter.sort_by) params.append('sort_by', filter.sort_by);
      if (filter.sort_order) params.append('sort_order', filter.sort_order);
    }
    return fetchWithAuth<ListLeaveRequestResponse>(`${API_URL}/leave/requests/my?${params}`, {
      method: 'GET',
    });
  },

  createRequest: async (data: CreateLeaveRequestPayload, attachment?: File): Promise<ApiResponse<LeaveRequest>> => {
    // Backend expects multipart form with 'data' field as JSON string
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    
    if (attachment) {
      formData.append('attachment', attachment);
    }

    const token = getAccessToken();
    const response = await fetch(`${API_URL}/leave/requests`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      credentials: 'include',
    });
    return handleResponse<LeaveRequest>(response);
  },

  approveRequest: async (id: string, reason?: string): Promise<ApiResponse<LeaveRequest>> => {
    return fetchWithAuth<LeaveRequest>(`${API_URL}/leave/requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ request_id: id, reason }),
    });
  },

  rejectRequest: async (id: string, reason?: string): Promise<ApiResponse<LeaveRequest>> => {
    return fetchWithAuth<LeaveRequest>(`${API_URL}/leave/requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ request_id: id, reason }),
    });
  },
};

// ============================================
// Master Data API (Branch, Grade, Position)
// ============================================

export const masterApi = {
  // Branches
  listBranches: async (): Promise<ApiResponse<Branch[]>> => {
    return fetchWithAuth<Branch[]>(`${API_URL}/master/branches`, {
      method: 'GET',
    });
  },

  getBranch: async (id: string): Promise<ApiResponse<Branch>> => {
    return fetchWithAuth<Branch>(`${API_URL}/master/branches/${id}`, {
      method: 'GET',
    });
  },

  createBranch: async (data: CreateBranchRequest): Promise<ApiResponse<Branch>> => {
    return fetchWithAuth<Branch>(`${API_URL}/master/branches`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateBranch: async (id: string, data: Partial<CreateBranchRequest>): Promise<ApiResponse<Branch>> => {
    return fetchWithAuth<Branch>(`${API_URL}/master/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteBranch: async (id: string): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/master/branches/${id}`, {
      method: 'DELETE',
    });
  },

  // Grades
  listGrades: async (): Promise<ApiResponse<Grade[]>> => {
    return fetchWithAuth<Grade[]>(`${API_URL}/master/grades`, {
      method: 'GET',
    });
  },

  getGrade: async (id: string): Promise<ApiResponse<Grade>> => {
    return fetchWithAuth<Grade>(`${API_URL}/master/grades/${id}`, {
      method: 'GET',
    });
  },

  createGrade: async (data: CreateGradeRequest): Promise<ApiResponse<Grade>> => {
    return fetchWithAuth<Grade>(`${API_URL}/master/grades`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateGrade: async (id: string, data: Partial<CreateGradeRequest>): Promise<ApiResponse<Grade>> => {
    return fetchWithAuth<Grade>(`${API_URL}/master/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteGrade: async (id: string): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/master/grades/${id}`, {
      method: 'DELETE',
    });
  },

  // Positions
  listPositions: async (): Promise<ApiResponse<Position[]>> => {
    return fetchWithAuth<Position[]>(`${API_URL}/master/positions`, {
      method: 'GET',
    });
  },

  getPosition: async (id: string): Promise<ApiResponse<Position>> => {
    return fetchWithAuth<Position>(`${API_URL}/master/positions/${id}`, {
      method: 'GET',
    });
  },

  createPosition: async (data: CreatePositionRequest): Promise<ApiResponse<Position>> => {
    return fetchWithAuth<Position>(`${API_URL}/master/positions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePosition: async (id: string, data: Partial<CreatePositionRequest>): Promise<ApiResponse<Position>> => {
    return fetchWithAuth<Position>(`${API_URL}/master/positions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePosition: async (id: string): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/master/positions/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// Schedule API
// ============================================

export const scheduleApi = {
  // Work Schedules
  list: async (): Promise<ApiResponse<WorkSchedule[]>> => {
    return fetchWithAuth<WorkSchedule[]>(`${API_URL}/schedule`, {
      method: 'GET',
    });
  },

  get: async (id: string): Promise<ApiResponse<WorkSchedule>> => {
    return fetchWithAuth<WorkSchedule>(`${API_URL}/schedule/${id}`, {
      method: 'GET',
    });
  },

  create: async (data: Partial<WorkSchedule>): Promise<ApiResponse<WorkSchedule>> => {
    return fetchWithAuth<WorkSchedule>(`${API_URL}/schedule`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<WorkSchedule>): Promise<ApiResponse<WorkSchedule>> => {
    return fetchWithAuth<WorkSchedule>(`${API_URL}/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/schedule/${id}`, {
      method: 'DELETE',
    });
  },

  // Assign schedule to employee
  assignToEmployee: async (scheduleId: string, employeeId: string, data: { start_date: string; end_date?: string }): Promise<ApiResponse<EmployeeScheduleAssignment>> => {
    return fetchWithAuth<EmployeeScheduleAssignment>(`${API_URL}/schedule/${scheduleId}/employee/${employeeId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get employee schedule timeline
  getEmployeeTimeline: async (employeeId: string): Promise<ApiResponse<EmployeeScheduleAssignment[]>> => {
    return fetchWithAuth<EmployeeScheduleAssignment[]>(`${API_URL}/schedule/employee/${employeeId}`, {
      method: 'GET',
    });
  },

  // Schedule Times
  getTime: async (id: string): Promise<ApiResponse<WorkScheduleTime>> => {
    return fetchWithAuth<WorkScheduleTime>(`${API_URL}/schedule/times/${id}`, {
      method: 'GET',
    });
  },

  createTime: async (data: Partial<WorkScheduleTime>): Promise<ApiResponse<WorkScheduleTime>> => {
    return fetchWithAuth<WorkScheduleTime>(`${API_URL}/schedule/times`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTime: async (id: string, data: Partial<WorkScheduleTime>): Promise<ApiResponse<WorkScheduleTime>> => {
    return fetchWithAuth<WorkScheduleTime>(`${API_URL}/schedule/times/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteTime: async (id: string): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/schedule/times/${id}`, {
      method: 'DELETE',
    });
  },

  // Schedule Locations
  getLocation: async (id: string): Promise<ApiResponse<WorkScheduleLocation>> => {
    return fetchWithAuth<WorkScheduleLocation>(`${API_URL}/schedule/locations/${id}`, {
      method: 'GET',
    });
  },

  createLocation: async (data: Partial<WorkScheduleLocation>): Promise<ApiResponse<WorkScheduleLocation>> => {
    return fetchWithAuth<WorkScheduleLocation>(`${API_URL}/schedule/locations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateLocation: async (id: string, data: Partial<WorkScheduleLocation>): Promise<ApiResponse<WorkScheduleLocation>> => {
    return fetchWithAuth<WorkScheduleLocation>(`${API_URL}/schedule/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteLocation: async (id: string): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/schedule/locations/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// Employee Schedules API
// ============================================

export const employeeSchedulesApi = {
  list: async (employeeId?: string): Promise<ApiResponse<EmployeeScheduleAssignment[]>> => {
    const params = employeeId ? `?employee_id=${employeeId}` : '';
    return fetchWithAuth<EmployeeScheduleAssignment[]>(`${API_URL}/employee-schedules${params}`, {
      method: 'GET',
    });
  },

  get: async (id: string): Promise<ApiResponse<EmployeeScheduleAssignment>> => {
    return fetchWithAuth<EmployeeScheduleAssignment>(`${API_URL}/employee-schedules/${id}`, {
      method: 'GET',
    });
  },

  getActive: async (): Promise<ApiResponse<EmployeeScheduleAssignment>> => {
    return fetchWithAuth<EmployeeScheduleAssignment>(`${API_URL}/employee-schedules/active`, {
      method: 'GET',
    });
  },

  create: async (data: { employee_id: string; work_schedule_id: string; start_date: string; end_date?: string }): Promise<ApiResponse<EmployeeScheduleAssignment>> => {
    return fetchWithAuth<EmployeeScheduleAssignment>(`${API_URL}/employee-schedules`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<EmployeeScheduleAssignment>): Promise<ApiResponse<EmployeeScheduleAssignment>> => {
    return fetchWithAuth<EmployeeScheduleAssignment>(`${API_URL}/employee-schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/employee-schedules/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// Attendance API
// ============================================

export const attendanceApi = {
  list: async (filter?: AttendanceFilter): Promise<ApiResponse<Attendance[]>> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return fetchWithAuth<Attendance[]>(`${API_URL}/attendance?${params}`, {
      method: 'GET',
    });
  },

  get: async (id: string): Promise<ApiResponse<Attendance>> => {
    return fetchWithAuth<Attendance>(`${API_URL}/attendance/${id}`, {
      method: 'GET',
    });
  },

  getMyAttendance: async (): Promise<ApiResponse<Attendance[]>> => {
    return fetchWithAuth<Attendance[]>(`${API_URL}/attendance/my`, {
      method: 'GET',
    });
  },

  clockIn: async (data: ClockInRequest): Promise<ApiResponse<Attendance>> => {
    return fetchWithAuth<Attendance>(`${API_URL}/attendance/clock-in`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  clockOut: async (data: ClockOutRequest): Promise<ApiResponse<Attendance>> => {
    return fetchWithAuth<Attendance>(`${API_URL}/attendance/clock-out`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Attendance>): Promise<ApiResponse<Attendance>> => {
    return fetchWithAuth<Attendance>(`${API_URL}/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/attendance/${id}`, {
      method: 'DELETE',
    });
  },

  approve: async (id: string): Promise<ApiResponse<Attendance>> => {
    return fetchWithAuth<Attendance>(`${API_URL}/attendance/${id}/approve`, {
      method: 'POST',
    });
  },

  reject: async (id: string): Promise<ApiResponse<Attendance>> => {
    return fetchWithAuth<Attendance>(`${API_URL}/attendance/${id}/reject`, {
      method: 'POST',
    });
  },
};

// ============================================
// Invitation API
// ============================================

export const invitationApi = {
  getByToken: async (token: string): Promise<ApiResponse<Invitation>> => {
    const response = await fetch(`${API_URL}/invitations/view/${token}`, {
      method: 'GET',
    });
    return handleResponse<Invitation>(response);
  },

  listMyInvitations: async (): Promise<ApiResponse<Invitation[]>> => {
    return fetchWithAuth<Invitation[]>(`${API_URL}/invitations/my`, {
      method: 'GET',
    });
  },

  accept: async (token: string): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/invitations/${token}/accept`, {
      method: 'POST',
    });
  },
};

// ============================================
// Payroll API
// ============================================

export const payrollApi = {
  // Settings
  getSettings: async (): Promise<ApiResponse<PayrollSettings>> => {
    return fetchWithAuth<PayrollSettings>(`${API_URL}/payroll/settings`, {
      method: 'GET',
    });
  },

  updateSettings: async (data: UpdatePayrollSettingsRequest): Promise<ApiResponse<PayrollSettings>> => {
    return fetchWithAuth<PayrollSettings>(`${API_URL}/payroll/settings`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Components
  listComponents: async (activeOnly?: boolean): Promise<ApiResponse<PayrollComponent[]>> => {
    const params = new URLSearchParams();
    if (activeOnly) params.append('active_only', 'true');
    return fetchWithAuth<PayrollComponent[]>(`${API_URL}/payroll/components?${params}`, {
      method: 'GET',
    });
  },

  getComponent: async (id: string): Promise<ApiResponse<PayrollComponent>> => {
    return fetchWithAuth<PayrollComponent>(`${API_URL}/payroll/components/${id}`, {
      method: 'GET',
    });
  },

  createComponent: async (data: CreatePayrollComponentRequest): Promise<ApiResponse<PayrollComponent>> => {
    return fetchWithAuth<PayrollComponent>(`${API_URL}/payroll/components`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateComponent: async (id: string, data: Partial<PayrollComponent>): Promise<ApiResponse<PayrollComponent>> => {
    return fetchWithAuth<PayrollComponent>(`${API_URL}/payroll/components/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteComponent: async (id: string): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/payroll/components/${id}`, {
      method: 'DELETE',
    });
  },

  // Employee Components
  assignComponent: async (employeeId: string, data: AssignComponentRequest): Promise<ApiResponse<EmployeePayrollComponent>> => {
    return fetchWithAuth<EmployeePayrollComponent>(`${API_URL}/payroll/employees/${employeeId}/components`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getEmployeeComponents: async (employeeId: string): Promise<ApiResponse<EmployeePayrollComponent[]>> => {
    return fetchWithAuth<EmployeePayrollComponent[]>(`${API_URL}/payroll/employees/${employeeId}/components`, {
      method: 'GET',
    });
  },

  updateEmployeeComponent: async (id: string, data: { amount?: string; effective_date?: string; end_date?: string }): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/payroll/employee-components/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  removeEmployeeComponent: async (id: string): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/payroll/employee-components/${id}`, {
      method: 'DELETE',
    });
  },

  // Payroll Records
  generate: async (data: GeneratePayrollRequest): Promise<ApiResponse<PayrollRecord[]>> => {
    return fetchWithAuth<PayrollRecord[]>(`${API_URL}/payroll/generate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  listRecords: async (filter?: PayrollFilter): Promise<ApiResponse<ListPayrollRecordResponse>> => {
    const params = new URLSearchParams();
    if (filter) {
      if (filter.period_month) params.append('period_month', String(filter.period_month));
      if (filter.period_year) params.append('period_year', String(filter.period_year));
      if (filter.status) params.append('status', filter.status);
      if (filter.employee_id) params.append('employee_id', filter.employee_id);
      if (filter.page) params.append('page', String(filter.page));
      if (filter.limit) params.append('limit', String(filter.limit));
      if (filter.sort_by) params.append('sort_by', filter.sort_by);
      if (filter.sort_order) params.append('sort_order', filter.sort_order);
    }
    return fetchWithAuth<ListPayrollRecordResponse>(`${API_URL}/payroll/records?${params}`, {
      method: 'GET',
    });
  },

  getRecord: async (id: string): Promise<ApiResponse<PayrollRecord>> => {
    return fetchWithAuth<PayrollRecord>(`${API_URL}/payroll/records/${id}`, {
      method: 'GET',
    });
  },

  updateRecord: async (id: string, data: Partial<PayrollRecord>): Promise<ApiResponse<PayrollRecord>> => {
    return fetchWithAuth<PayrollRecord>(`${API_URL}/payroll/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteRecord: async (id: string): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/payroll/records/${id}`, {
      method: 'DELETE',
    });
  },

  finalize: async (data: FinalizePayrollRequest): Promise<ApiResponse<null>> => {
    return fetchWithAuth<null>(`${API_URL}/payroll/finalize`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getSummary: async (periodMonth: number, periodYear: number): Promise<ApiResponse<PayrollSummary>> => {
    const params = new URLSearchParams();
    params.append('period_month', String(periodMonth));
    params.append('period_year', String(periodYear));
    return fetchWithAuth<PayrollSummary>(`${API_URL}/payroll/summary?${params}`, {
      method: 'GET',
    });
  },
};

// ============================================
// Dashboard API
// ============================================

export const dashboardApi = {
  getDashboard: async (): Promise<ApiResponse<DashboardData>> => {
    return fetchWithAuth<DashboardData>(`${API_URL}/dashboard`, {
      method: 'GET',
    });
  },

  getEmployeeCurrentNumber: async (): Promise<ApiResponse<{ total: number; active: number; inactive: number }>> => {
    return fetchWithAuth<{ total: number; active: number; inactive: number }>(`${API_URL}/dashboard/employee-current-number`, {
      method: 'GET',
    });
  },

  getEmployeeStatusStats: async (): Promise<ApiResponse<EmployeeStatusStats>> => {
    return fetchWithAuth<EmployeeStatusStats>(`${API_URL}/dashboard/employee-status-stats`, {
      method: 'GET',
    });
  },

  getMonthlyAttendance: async (month?: number, year?: number): Promise<ApiResponse<{ date: string; count: number }[]>> => {
    const params = new URLSearchParams();
    if (month) params.append('month', String(month));
    if (year) params.append('year', String(year));
    return fetchWithAuth<{ date: string; count: number }[]>(`${API_URL}/dashboard/monthly-attendance?${params}`, {
      method: 'GET',
    });
  },

  getDailyAttendanceStats: async (): Promise<ApiResponse<DailyAttendanceStats>> => {
    return fetchWithAuth<DailyAttendanceStats>(`${API_URL}/dashboard/daily-attendance-stats`, {
      method: 'GET',
    });
  },
};
