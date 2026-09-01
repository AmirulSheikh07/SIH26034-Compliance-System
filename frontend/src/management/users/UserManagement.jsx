import React, { useState, useEffect } from 'react';
import { getUsers, addUser, updateUser } from '../../shared/services/userService';
import { useAuth } from '../../shared/context/AuthContext';
import { UserPlus, ToggleLeft, ToggleRight, ShieldAlert, X, Shield } from 'lucide-react';

const UserManagement = () => {
  const { user: currentUser } = useAuth();

  // Data States
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Inspector');
  const [newDept, setNewDept] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addUser({
        name: newName,
        email: newEmail,
        role: newRole,
        department: newDept
      });
      setIsModalOpen(false);
      // Reset fields
      setNewName('');
      setNewEmail('');
      setNewRole('Inspector');
      setNewDept('');
      loadUsers();
    } catch (err) {
      alert('Failed to register user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateUser(id, { status: nextStatus });
      loadUsers();
    } catch (err) {
      alert('Failed to change user status.');
    }
  };

  const handleChangeRole = async (id, nextRole) => {
    try {
      await updateUser(id, { role: nextRole });
      loadUsers();
    } catch (err) {
      alert('Failed to update user authorization role.');
    }
  };

  // Safe Guard: Check admin permissions inside component
  if (currentUser?.role !== 'Administrator') {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900 p-6 text-center text-rose-700 dark:text-rose-450 max-w-md mx-auto mt-12">
        <ShieldAlert className="mx-auto h-8 w-8 mb-2" />
        <h3 className="font-bold text-lg">Access Denied</h3>
        <p className="text-xs mt-1">This module is reserved exclusively for system administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 antialiased text-slate-800 dark:text-slate-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">User Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Register official metrology operators, manage departments, and assign access roles</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded bg-slate-800 dark:bg-slate-200 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-semibold transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          Add Department Officer
        </button>
      </div>

      {/* Database User Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 dark:border-slate-450 border-t-transparent mx-auto" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-rose-750 font-semibold">{error}</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-bold uppercase tracking-wider text-slate-555 dark:text-slate-450 select-none">
                  <th className="px-5 py-3">Employee Name</th>
                  <th className="px-5 py-3">Official Email</th>
                  <th className="px-5 py-3">System Role</th>
                  <th className="px-5 py-3">Department Division</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Last Login Activity</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-750">
                          {u.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-550 dark:text-slate-400 font-mono text-[11px]">{u.email}</td>
                    <td className="px-5 py-4">
                      {/* Role selection dropdown */}
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:border-slate-800 dark:focus:border-slate-700 focus:outline-hidden"
                      >
                        <option value="Administrator">Administrator</option>
                        <option value="Enforcement Officer">Enforcement Officer</option>
                        <option value="Inspector">Inspector</option>
                        <option value="Reviewer">Reviewer</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-medium">{u.department}</td>
                    <td className="px-5 py-4">
                      <span 
                        className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          u.status === 'Active'
                            ? 'border-emerald-250 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                            : 'border-slate-250 bg-slate-50 dark:bg-slate-950/40 text-slate-500'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-450 dark:text-slate-500 font-medium">
                      {u.lastActive === 'Never' ? 'Never' : new Date(u.lastActive).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleStatus(u.id, u.status)}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-[11px] font-semibold text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        {u.status === 'Active' ? (
                          <>
                            <ToggleRight className="h-4.5 w-4.5 text-blue-700 dark:text-blue-500 shrink-0" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4.5 w-4.5 text-slate-450 dark:text-slate-600 shrink-0" />
                            Activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 px-5 py-4 bg-slate-50/50 dark:bg-slate-950/20">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Shield className="h-4.5 w-4.5 text-blue-700 dark:text-blue-500" />
                Register Department Officer
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-450 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddUser} className="p-5 space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="block w-full rounded border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-955 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-slate-850 dark:focus:border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-slate-850"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">
                  Official Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@gov.in"
                  className="block w-full rounded border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-955 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-slate-850 dark:focus:border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-slate-850"
                />
              </div>

              {/* Department division */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">
                  Department Division
                </label>
                <input
                  type="text"
                  required
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  placeholder="e.g. Central Metrology Directorate"
                  className="block w-full rounded border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-955 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-slate-850 dark:focus:border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-slate-850"
                />
              </div>

              {/* Select Role */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">
                  Security Access Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="block w-full rounded border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-955 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-slate-850 dark:focus:border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-slate-850"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Enforcement Officer">Enforcement Officer</option>
                  <option value="Inspector">Inspector</option>
                  <option value="Reviewer">Reviewer</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded border border-slate-250 dark:border-slate-750 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded bg-slate-800 dark:bg-slate-200 px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-900 hover:bg-slate-900 dark:hover:bg-white transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Registering...' : 'Register User'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
