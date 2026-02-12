import React, { createContext, useState } from 'react';
import api from "../config/axios";
import { useNavigate } from "react-router-dom";

export const GeneralContext = createContext();

const GeneralContextProvider = ({children}) => {

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usertype, setUsertype] = useState('');

  const [ticketBookingDate, setTicketBookingDate] = useState();

  const inputs = {username, email, usertype, password};

  // Premium Modal State
  const [modal, setModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
    onConfirm: null,
    showCancel: false
  });

  const navigate = useNavigate();

  // Premium Modal Functions
  const showModal = (title, message, type = 'info', onConfirm = null, showCancel = false) => {
    setModal({
      show: true,
      title,
      message,
      type,
      onConfirm,
      showCancel
    });
  };

  const hideModal = () => {
    setModal(prev => ({ ...prev, show: false }));
  };

  const showSuccess = (title, message) => {
    showModal(title, message, 'success');
  };

  const showError = (title, message) => {
    showModal(title, message, 'error');
  };

  const showWarning = (title, message, onConfirm = null, showCancel = false) => {
    showModal(title, message, 'warning', onConfirm, showCancel);
  };

  const showInfo = (title, message) => {
    showModal(title, message, 'info');
  };

  const login = async () => {
    try {
      const loginInputs = { email, password };
      await api.post('/login', loginInputs)
        .then(async (res) => {
          localStorage.setItem('userId', res.data._id);
          localStorage.setItem('userType', res.data.usertype);
          localStorage.setItem('username', res.data.username);
          localStorage.setItem('email', res.data.email);

          showSuccess('Welcome Back!', `Hello ${res.data.username}, you've successfully logged in.`);

          setTimeout(() => {
            if (res.data.usertype === 'customer') {
              navigate('/');
            } else if (res.data.usertype === 'admin') {
              navigate('/admin');
            } else if (res.data.usertype === 'flight-operator') {
              navigate('/flight-admin');
            }
          }, 1500);

        }).catch((err) => {
          const status = err.response?.status;
          const message = err.response?.data?.message;

          if (status === 401) {
            // Backend returns 401 for both wrong password AND user not found
            // We use the exact message from backend to distinguish them
            showError('Login Failed', message || 'Invalid email or password. Please try again.');
          } else if (status === 403) {
            // User exists but has not verified their email yet
            showError('Email Not Verified', 'Please verify your email address before logging in.');
          } else if (status === 500) {
            showError('Server Error', 'Something went wrong on our end. Please try again later.');
          } else {
            showError('Login Failed', message || 'Something went wrong. Please try again later.');
          }

          console.log(err);
        });

    } catch (err) {
      showError('Login Failed', 'Something went wrong. Please try again later.');
      console.log(err);
    }
  }

  const register = async () => {
    try {
      await api.post('/register', inputs)
        .then(async (res) => {
          localStorage.setItem('userId', res.data._id);
          localStorage.setItem('userType', res.data.usertype);
          localStorage.setItem('username', res.data.username);
          localStorage.setItem('email', res.data.email);

          showSuccess('Registration Successful!', `Welcome ${res.data.username}! Your account has been created.`);

          setTimeout(() => {
            if (res.data.usertype === 'customer') {
              navigate('/');
            } else if (res.data.usertype === 'admin') {
              navigate('/admin');
            } else if (res.data.usertype === 'flight-operator') {
              navigate('/flight-admin');
            }
          }, 1500);

        }).catch((err) => {
          const status = err.response?.status;
          const message = err.response?.data?.message;

          if (status === 400) {
            // Backend returns 400 for 'User already exists with this email'
            showError('Account Already Exists', message || 'An account with this email already exists. Please login instead.');
          } else if (status === 500) {
            showError('Server Error', 'Something went wrong on our end. Please try again later.');
          } else {
            showError('Registration Failed', message || 'Unable to create account. Please try again.');
          }

          console.log(err);
        });

    } catch (err) {
      showError('Registration Failed', 'Something went wrong. Please try again later.');
      console.log(err);
    }
  }

  const logout = async () => {
    localStorage.clear();
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        localStorage.removeItem(key);
      }
    }

    showSuccess('Logged Out', 'You have been successfully logged out.');

    setTimeout(() => {
      navigate('/');
    }, 1000);
  }

  return (
    <GeneralContext.Provider value={{
      login, register, logout,
      username, setUsername,
      email, setEmail,
      password, setPassword,
      usertype, setUsertype,
      ticketBookingDate, setTicketBookingDate,
      modal, setModal,
      showModal, hideModal,
      showSuccess, showError, showWarning, showInfo
    }}>
      {children}
    </GeneralContext.Provider>
  )
}

export default GeneralContextProvider;