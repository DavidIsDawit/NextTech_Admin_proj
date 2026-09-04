import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';

export function UserForm({ formData, onChange, errors, formType }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    if (name === 'role' && formType === 'add') {
      const currentEmpId = formData.employeId || '';
      const num = currentEmpId.replace(/^(EMP|ADM)/i, '') || Math.floor(1000 + Math.random() * 9000);
      const prefix = value.toLowerCase() === 'admin' ? 'ADM' : 'EMP';
      updated.employeId = `${prefix}${num}`;
    }

    onChange(updated);
  };

  // Map backend roles or use static roles
  const roles = ["Admin", "User"];

  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className={errors.name ? 'text-red-500' : ''}>
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Ali Noris"
          value={formData.name || ''}
          onChange={handleChange}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role" className={errors.role ? 'text-red-500' : ''}>
          Role <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <select
            id="role"
            name="role"
            value={formData.role || ''}
            onChange={handleChange}
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${
              errors.role ? 'border-red-500 focus-visible:ring-red-500' : ''
            }`}
          >
            <option value="" disabled>Select Role</option>
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors.role && (
          <p className="text-sm text-red-500">{errors.role}</p>
        )}
      </div>

      {/* Employee ID */}
      <div className="space-y-2">
        <Label htmlFor="employeId" className={errors.employeId ? 'text-red-500' : ''}>
          Employee ID <span className="text-red-500">*</span>
        </Label>
        <Input
          id="employeId"
          name="employeId"
          placeholder="e.g. EMP1001"
          value={formData.employeId || ''}
          onChange={handleChange}
          disabled={formType === 'edit'}
          className={`disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${
            errors.employeId ? 'border-red-500' : ''
          }`}
        />
        {errors.employeId && (
          <p className="text-sm text-red-500">{errors.employeId}</p>
        )}
      </div>



      {/* Email/Username */}
      <div className="space-y-2">
        <Label htmlFor="email" className={errors.email ? 'text-red-500' : ''}>
          Email/Username <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="example@mail.com"
          value={formData.email || ''}
          onChange={handleChange}
          autoComplete="off"
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Password (for Add User) */}
      {formType === 'add' && (
        <div className="space-y-2">
          <Label htmlFor="password" className={errors.password ? 'text-red-500' : ''}>
            Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="********"
              value={formData.password || ''}
              onChange={handleChange}
              autoComplete="new-password"
              className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>
      )}

      {/* Password Reset Section (for Edit User) */}
      {formType === 'edit' && (
        <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Password Reset</h3>
          <div className="space-y-2">
            <Label htmlFor="new-password" className={errors.password ? 'text-red-500' : ''}>
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                name="password"
                placeholder="********"
                value={formData.password || ''}
                onChange={handleChange}
                autoComplete="new-password"
                className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
