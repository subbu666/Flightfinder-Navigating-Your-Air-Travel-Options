import React from 'react'
import { Navigate } from 'react-router-dom';

const LoginProtector = ({children}) => {

    const userType = localStorage.getItem('userType');

    if (userType) {
        if (userType === 'customer') {
            return <Navigate to='/' replace />;
        } else if (userType === 'admin') {
            return <Navigate to='/admin' replace />;
        } else if (userType === 'flight-operator') {
            return <Navigate to='/flight-admin' replace />; // ✅ Fixed: was missing, operators could still see /auth
        }
    }

    return children;
}

export default LoginProtector;