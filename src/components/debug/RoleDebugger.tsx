

import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/contexts/AuthContext';

export const RoleDebugger: React.FC = () => {
  const { role, getPermissions, getRoleName, getRoleDesc } = usePermission();
  const { userProfile } = useAuth();

  // Chỉ hiển thị trong development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs font-mono z-50">
      <div className="mb-2 font-bold text-yellow-400">🔐 RBAC Debug Info</div>

      <div className="space-y-1">
        <div>
          <span className="text-blue-400">Role:</span> {role || 'N/A'}
        </div>
        <div>
          <span className="text-blue-400">Display Name:</span> {getRoleName()}
        </div>
        <div>
          <span className="text-blue-400">Description:</span> {getRoleDesc()}
        </div>

        <div className="mt-2 border-t border-gray-700 pt-2">
          <div className="text-green-400 font-bold mb-1">Permissions:</div>
          <div className="max-h-40 overflow-y-auto">
            {getPermissions().length > 0 ? (
              getPermissions().map((perm) => (
                <div key={perm} className="text-green-300">
                  ✓ {perm}
                </div>
              ))
            ) : (
              <div className="text-red-400">No permissions</div>
            )}
          </div>
        </div>

        <div className="mt-2 border-t border-gray-700 pt-2">
          <div className="text-cyan-400 font-bold mb-1">User Profile:</div>
          <div className="text-cyan-300 max-h-40 overflow-y-auto">
            <div>ID: {userProfile?.id || 'N/A'}</div>
            <div>Name: {userProfile?.fullName || 'N/A'}</div>
            <div>Email: {userProfile?.email || 'N/A'}</div>
            <div>Roles: {userProfile?.roleNames?.join(', ') || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDebugger;

