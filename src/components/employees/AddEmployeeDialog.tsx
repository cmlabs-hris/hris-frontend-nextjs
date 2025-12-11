"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Upload, User, Plus } from "lucide-react";
import Image from "next/image";
import { CreateEmployeeRequest, Position, Grade, Branch, WorkSchedule } from "@/lib/api";

interface AddEmployeeDialogProps {
  positions: Position[];
  grades: Grade[];
  branches: Branch[];
  workSchedules: WorkSchedule[];
  onAddEmployee: (data: CreateEmployeeRequest, avatarFile?: File) => Promise<void>;
}

const initialFormData: Omit<CreateEmployeeRequest, 'work_schedule_id' | 'position_id' | 'grade_id'> & {
  work_schedule_id: string;
  position_id: string;
  grade_id: string;
} = {
  email: "",
  full_name: "",
  employee_code: "",
  phone_number: "",
  work_schedule_id: "",
  position_id: "",
  grade_id: "",
  branch_id: "",
  hire_date: new Date().toISOString().split("T")[0],
  employment_type: "permanent",
  gender: "Male",
  role: "employee",
};

export default function AddEmployeeDialog({
  positions,
  grades,
  branches,
  workSchedules,
  onAddEmployee,
}: AddEmployeeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEmployeeRequest>(initialFormData);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData(initialFormData);
    setAvatarFile(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
    setErrors({});
    setIsLoading(false);
  };

  const handleInputChange = (field: keyof CreateEmployeeRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          avatar: "Only JPG and PNG files are allowed",
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          avatar: "File size must be less than 5MB",
        }));
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.avatar;
        return newErrors;
      });
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.employee_code.trim()) {
      newErrors.employee_code = "Employee code is required";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    }

    if (!formData.work_schedule_id) {
      newErrors.work_schedule_id = "Work schedule is required";
    }

    if (!formData.position_id) {
      newErrors.position_id = "Position is required";
    }

    if (!formData.grade_id) {
      newErrors.grade_id = "Grade is required";
    }

    if (!formData.hire_date) {
      newErrors.hire_date = "Hire date is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await onAddEmployee(formData, avatarFile || undefined);
      setIsOpen(false);
      resetForm();
    } catch (err) {
      // Error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const employmentTypes = useMemo(
    () => [
      { value: "permanent", label: "Permanent" },
      { value: "contract", label: "Contract" },
      { value: "probation", label: "Probation" },
      { value: "internship", label: "Internship" },
      { value: "freelance", label: "Freelance" },
    ],
    []
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Employee</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Fill in the employee details below. An invitation email will be sent to the employee.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {avatarPreview ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm">
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            {errors.avatar && (
              <p className="text-red-500 text-sm">{errors.avatar}</p>
            )}
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Enter full name"
                className={errors.full_name ? "border-red-500" : ""}
              />
              {errors.full_name && (
                <p className="text-red-500 text-sm">{errors.full_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee_code">
                Employee Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="employee_code"
                value={formData.employee_code}
                onChange={(e) => handleInputChange("employee_code", e.target.value)}
                placeholder="e.g., EMP001"
                className={errors.employee_code ? "border-red-500" : ""}
              />
              {errors.employee_code && (
                <p className="text-red-500 text-sm">{errors.employee_code}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
                placeholder="Enter phone number"
                className={errors.phone_number ? "border-red-500" : ""}
              />
              {errors.phone_number && (
                <p className="text-red-500 text-sm">{errors.phone_number}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">
                Gender <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleInputChange("gender", value)}
              >
                <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-red-500 text-sm">{errors.gender}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hire_date">
                Hire Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => handleInputChange("hire_date", e.target.value)}
                className={errors.hire_date ? "border-red-500" : ""}
              />
              {errors.hire_date && (
                <p className="text-red-500 text-sm">{errors.hire_date}</p>
              )}
            </div>
          </div>

          {/* Position and Organization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="work_schedule_id">
                Work Schedule <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.work_schedule_id}
                onValueChange={(value) => handleInputChange("work_schedule_id", value)}
              >
                <SelectTrigger className={errors.work_schedule_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select work schedule" />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(workSchedules) ? workSchedules : []).map((schedule) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {schedule.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.work_schedule_id && (
                <p className="text-red-500 text-sm">{errors.work_schedule_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position_id">
                Position <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.position_id}
                onValueChange={(value) => handleInputChange("position_id", value)}
              >
                <SelectTrigger className={errors.position_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position.id} value={position.id}>
                      {position.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.position_id && (
                <p className="text-red-500 text-sm">{errors.position_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade_id">
                Grade <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.grade_id}
                onValueChange={(value) => handleInputChange("grade_id", value)}
              >
                <SelectTrigger className={errors.grade_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.grade_id && (
                <p className="text-red-500 text-sm">{errors.grade_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch_id">Branch</Label>
              <Select
                value={formData.branch_id || ""}
                onValueChange={(value) => handleInputChange("branch_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment_type">Employment Type</Label>
              <Select
                value={formData.employment_type}
                onValueChange={(value) => handleInputChange("employment_type", value as CreateEmployeeRequest['employment_type'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  {employmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role || "employee"}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_salary">Base Salary</Label>
              <Input
                id="base_salary"
                type="number"
                value={formData.base_salary || ""}
                onChange={(e) => handleInputChange("base_salary", e.target.value ? parseFloat(e.target.value) : 0)}
                placeholder="Enter base salary (optional)"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nik">NIK (National ID)</Label>
              <Input
                id="nik"
                value={formData.nik || ""}
                onChange={(e) => handleInputChange("nik", e.target.value)}
                placeholder="Enter NIK (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="place_of_birth">Place of Birth</Label>
              <Input
                id="place_of_birth"
                value={formData.place_of_birth || ""}
                onChange={(e) => handleInputChange("place_of_birth", e.target.value)}
                placeholder="Enter place of birth (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob || ""}
                onChange={(e) => handleInputChange("dob", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                value={formData.education || ""}
                onChange={(e) => handleInputChange("education", e.target.value)}
                placeholder="Enter education (optional)"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter address (optional)"
              />
            </div>
          </div>

          {/* Bank Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Bank Information (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name || ""}
                  onChange={(e) => handleInputChange("bank_name", e.target.value)}
                  placeholder="e.g., BCA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_account_number">Account Number</Label>
                <Input
                  id="bank_account_number"
                  value={formData.bank_account_number || ""}
                  onChange={(e) => handleInputChange("bank_account_number", e.target.value)}
                  placeholder="Enter account number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_account_holder_name">Account Holder Name</Label>
                <Input
                  id="bank_account_holder_name"
                  value={formData.bank_account_holder_name || ""}
                  onChange={(e) => handleInputChange("bank_account_holder_name", e.target.value)}
                  placeholder="Enter account holder name"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Employee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

