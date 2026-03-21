import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { customToast } from '../../utils/toast';
import { Users, Shield, UserX, UserCheck, Search } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers();
      setUsers(res.data);
    } catch {
      customToast.error('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      customToast.success(`User role updated to ${newRole}`);
    } catch {
      customToast.error('Failed to update role.');
    }
  };

  const handleBlockToggle = async (userId, isBlocked) => {
    try {
      await adminService.toggleUserBlock(userId, isBlocked);
      setUsers(users.map(u => u._id === userId ? { ...u, isBlocked } : u));
      customToast.success(`User ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
    } catch {
      customToast.error('Failed to block/unblock user.');
    }
  };

  const filteredUsers = users.filter(usr => 
    usr.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    usr.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center">
            <span className="w-8 h-1 bg-primary-500 mr-3"></span>
            User Management
          </h1>
          <p className="text-slate-200 mt-2 font-medium tracking-wide">Manage roles, blocks, and platform access.</p>
        </div>
        
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors text-sm font-medium"
          />
        </div>
      </div>

      <div className="bg-dark-800 border border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-900 border-b border-dark-700 text-xs font-bold text-slate-200 uppercase tracking-widest">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredUsers.map((usr) => (
                <tr key={usr._id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-500/10 border border-primary-500/20 text-primary-500 flex items-center justify-center font-bold uppercase tracking-wider mr-4 shrink-0">
                        {usr.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-bold">{usr.name}</div>
                        <div className="text-slate-300 text-xs mt-0.5">{usr.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={usr.role}
                      onChange={(e) => handleRoleChange(usr._id, e.target.value)}
                      className="bg-dark-900 border border-dark-700 text-slate-300 text-xs uppercase tracking-widest font-bold px-3 py-2 outline-none focus:border-primary-500 transition-colors"
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-bold uppercase tracking-widest border ${
                      usr.isBlocked 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                        : 'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}>
                      {usr.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleBlockToggle(usr._id, !usr.isBlocked)}
                      className={`inline-flex items-center px-3 py-2 border text-xs font-bold uppercase tracking-widest transition-colors ${
                        usr.isBlocked
                          ? 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/30'
                          : 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30'
                      }`}
                    >
                      {usr.isBlocked ? (
                        <><UserCheck className="w-3 h-3 mr-2" /> Unblock</>
                      ) : (
                        <><UserX className="w-3 h-3 mr-2" /> Block</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-300 font-medium">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
