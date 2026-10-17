import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldAlert, LogIn, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, role, isDemo, loginAsDemo } = useAuth();
  const location = useLocation();

  // If visitor is not authenticated, redirect to login
  if (!isAuthenticated || role === 'public') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role doesn't match allowed roles
  if (allowedRoles && !allowedRoles.includes(role)) {
    const requiredRoleName = allowedRoles[0];

    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <Card className="p-6 text-center space-y-4 border-amber-300 dark:border-amber-800 shadow-soft">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Role Permission Required
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            This section is restricted to <strong>{requiredRoleName.toUpperCase()}</strong> accounts.
            You are currently signed in as <strong>{role.toUpperCase()}</strong>.
          </p>

          <div className="pt-2 flex flex-col gap-2 justify-center">
            {/* If in demo mode, allow quick demo persona switch */}
            {isDemo && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  loginAsDemo(requiredRoleName);
                }}
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                <span>Switch to {requiredRoleName} Demo Persona</span>
              </Button>
            )}

            <Link to="/login" state={{ from: location }}>
              <Button variant="outline" size="sm" fullWidth>
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                <span>Sign In With {requiredRoleName} Account</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return children ? <>{children}</> : null;
};
