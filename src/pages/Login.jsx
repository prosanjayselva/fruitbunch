import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, collection, setDoc, where, getDocs } from "firebase/firestore";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError("");

      let emailToLogin = formData.identifier;

      // Check if identifier is phone (not containing "@")
      if (!formData.identifier.includes("@")) {
        // Lookup phone → uid mapping
        const phoneDocRef = doc(db, "phoneToUid", formData.identifier);
        const phoneDoc = await getDoc(phoneDocRef);

        if (!phoneDoc.exists()) {
          throw new Error("No account found with this phone number");
        }

        const { uid } = phoneDoc.data();

        // Now fetch user profile to get email
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          throw new Error("User profile not found");
        }

        emailToLogin = userDoc.data().email;
      }

      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailToLogin,
        formData.password
      );

      const user = userCredential.user;

      // 2. Fetch user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const adminRef = doc(db, "admins", user.uid);
      const adminSnap = await getDoc(adminRef);

      const isAdminUser = adminSnap.exists();
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Set user state in localStorage
        setIsLoading(false);
        // Set isAdmin in localStorage
        localStorage.setItem("isAdmin", JSON.stringify(isAdminUser));
        // Store in localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            uid: user.uid,
            email: userData.email,
            name: userData.name,
            phone: userData.phone,
          })
        );

      } else {
        console.log("No user profile found in Firestore!");
      }

      setIsLoading(false);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error:", err.message);
      setError(err.message || "Invalid credentials");
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(true);
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowPassword(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 -right-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-40 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg z-10 transform transition-all duration-500 hover:shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-green-600 hover:text-green-500 transition-colors duration-300">
              create a new account
            </Link>
          </p>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <label htmlFor="identifier" className="sr-only">Email address or Phone Number</label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="email"
                required
                className="relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 peer"
                placeholder="Email address or Phone Number"
                value={formData.identifier}
                onChange={handleChange}
              />
            </div>

            {/* Password with Show/Hide */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 peer"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {/* Toggle icon */}
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <i className="fa-solid fa-eye-slash text-green-500 text-lg"></i>
                ) : (
                  <i className="fa-solid fa-eye text-green-500 text-lg"></i>
                )}
              </div>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded transition duration-150"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-green-600 hover:text-green-500 transition-colors duration-300">
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;