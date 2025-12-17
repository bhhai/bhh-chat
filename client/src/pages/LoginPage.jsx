import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import OptimizedImage from "../components/Image";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsAlert, setShowTermsAlert] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Only check terms for Sign Up
    if (currState === "Sign Up" && !termsAccepted) {
      setShowTermsAlert(true);
      return;
    }

    if (currState === "Sign Up" && !isDataSubmitted) {
      // Validate password match before proceeding
      if (password !== confirmPassword) {
        setPasswordMismatch(true);
        return;
      }
      setPasswordMismatch(false);
      setIsDataSubmitted(true);
      return;
    }

    setIsLoading(true);
    try {
      await login(currState === "Sign Up" ? "signup" : "login", {
        fullName,
        email,
        password,
        bio,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden relative z-10 border border-gray-100"
      >
        <div className="flex flex-col lg:flex-row h-full">
          {/* Branding Side - Enhanced with professional gradient */}
          <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-800 to-blue-900 p-12 relative overflow-hidden">
            {/* Abstract background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full filter blur-[90px]"></div>
              <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-white rounded-full filter blur-[90px]"></div>
            </div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 flex flex-col h-full justify-between text-white"
            >
              <div>
                <div className="flex items-center gap-3 mb-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <OptimizedImage
                      src={assets.logo_icon}
                      alt="BHH Chat logo"
                      width={40}
                      height={40}
                      className="h-10"
                      objectFit="contain"
                      priority
                    />
                  </motion.div>
                  <motion.span
                    className="text-2xl font-bold tracking-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    BHH Chat
                  </motion.span>
                </div>
                <motion.h1
                  className="text-4xl font-bold leading-tight mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {currState === "Sign Up"
                    ? "Join the Professional Network"
                    : "Welcome Back"}
                </motion.h1>
                <motion.p
                  className="text-blue-100 text-lg max-w-md leading-relaxed"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {currState === "Sign Up"
                    ? "Secure, professional communication platform designed for modern teams and enterprises."
                    : "Sign in to access your professional dashboard and continue conversations."}
                </motion.p>
              </div>

              <motion.div
                className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-100 font-medium">
                    Enterprise-grade security
                  </p>
                  <p className="font-medium">End-to-end encrypted</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Form Side - Enhanced with better spacing and typography */}
          <div className="flex-1 p-8 sm:p-12 relative">
            <div className="max-w-md w-full mx-auto">
              <div className="flex justify-between items-center mb-10">
                <motion.h2
                  className="text-3xl font-bold text-gray-900 tracking-tight"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {currState === "Sign Up" ? "Create Account" : "Sign In"}
                </motion.h2>
                {isDataSubmitted && (
                  <motion.button
                    onClick={() => setIsDataSubmitted(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                  </motion.button>
                )}
              </div>

              <form onSubmit={onSubmitHandler} className="space-y-6">
                <AnimatePresence mode="wait">
                  {currState === "Sign Up" && !isDataSubmitted && (
                    <motion.div
                      key="name"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 10, opacity: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-gray-700 text-sm font-medium">
                        Full Name
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          onChange={(e) => setFullName(e.target.value)}
                          value={fullName}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all group-hover:border-blue-300"
                          placeholder="Enter your full name"
                          required
                        />
                        <div className="absolute right-3 top-3 text-gray-400 group-hover:text-blue-500 transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isDataSubmitted && (
                  <>
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <label className="text-gray-700 text-sm font-medium">
                        Email Address
                      </label>
                      <div className="relative group">
                        <input
                          onChange={(e) => setEmail(e.target.value)}
                          value={email}
                          type="email"
                          placeholder="your@email.com"
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all group-hover:border-blue-300"
                        />
                        <div className="absolute right-3 top-3 text-gray-400 group-hover:text-blue-500 transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-2"
                    >
                      <label className="text-gray-700 text-sm font-medium">
                        Password
                      </label>
                      <div className="relative group">
                        <input
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordMismatch(false);
                          }}
                          value={password}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          className={`w-full px-4 py-3 pr-12 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all group-hover:border-blue-300 ${
                            passwordMismatch
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-200"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                        >
                          {showPassword ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.906 1.24L3.707 2.293zM14.577 11.752l-1.739-1.739a4 4 0 01-5.09-5.09L5.224 3.308A10.014 10.014 0 00.458 10c1.274 4.057 5.064 7 9.542 7a9.958 9.958 0 004.577-1.248z"
                                clipRule="evenodd"
                              />
                              <path d="M5 10a5 5 0 017.752-3.577l-1.739-1.739A4 4 0 0010 6a4 4 0 00-4 4c0 .738.21 1.425.577 2.014l-1.739 1.739A5 5 0 015 10z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </motion.div>

                    {currState === "Sign Up" && (
                      <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 10, opacity: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-2"
                      >
                        <label className="text-gray-700 text-sm font-medium">
                          Confirm Password
                        </label>
                        <div className="relative group">
                          <input
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setPasswordMismatch(false);
                            }}
                            value={confirmPassword}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            required={currState === "Sign Up"}
                            className={`w-full px-4 py-3 pr-12 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all group-hover:border-blue-300 ${
                              passwordMismatch
                                ? "border-red-300 focus:ring-red-500"
                                : "border-gray-200 focus:ring-blue-500"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-3 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                          >
                            {showConfirmPassword ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path
                                  fillRule="evenodd"
                                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.906 1.24L3.707 2.293zM14.577 11.752l-1.739-1.739a4 4 0 01-5.09-5.09L5.224 3.308A10.014 10.014 0 00.458 10c1.274 4.057 5.064 7 9.542 7a9.958 9.958 0 004.577-1.248z"
                                  clipRule="evenodd"
                                />
                                <path d="M5 10a5 5 0 017.752-3.577l-1.739-1.739A4 4 0 0010 6a4 4 0 00-4 4c0 .738.21 1.425.577 2.014l-1.739 1.739A5 5 0 015 10z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {passwordMismatch && (
                          <motion.p
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-sm text-red-500 flex items-center gap-2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Passwords do not match
                          </motion.p>
                        )}
                      </motion.div>
                    )}
                  </>
                )}

                <AnimatePresence>
                  {currState === "Sign Up" && isDataSubmitted && (
                    <motion.div
                      key="bio"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <label className="text-gray-700 text-sm font-medium">
                        Your Professional Bio
                      </label>
                      <textarea
                        onChange={(e) => setBio(e.target.value)}
                        value={bio}
                        rows={4}
                        placeholder="Briefly describe your professional background..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                      ></textarea>
                      <p className="text-xs text-gray-500">
                        This will be visible on your profile
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {currState === "Sign Up" && (
                  <motion.div
                    className="flex items-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={() => {
                          setTermsAccepted(!termsAccepted);
                          setShowTermsAlert(false);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all"
                      />
                    </div>
                    <div className="ml-3">
                      <label
                        htmlFor="terms"
                        className="block text-sm text-gray-700"
                      >
                        I agree to the{" "}
                        <span className="text-blue-600 cursor-pointer hover:underline font-medium">
                          Terms
                        </span>{" "}
                        and{" "}
                        <span className="text-blue-600 cursor-pointer hover:underline font-medium">
                          Privacy Policy
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        By creating an account, you agree to our terms and
                        conditions
                      </p>
                    </div>
                  </motion.div>
                )}

                {showTermsAlert && (
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-sm text-red-500 flex items-center gap-2 bg-red-50 p-3 rounded-lg"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Please accept the terms and conditions to continue
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  whileHover={isLoading ? {} : { scale: 1.01 }}
                  whileTap={isLoading ? {} : { scale: 0.99 }}
                  className={`w-full py-3 px-4 text-white font-medium rounded-lg transition-all shadow-sm flex items-center justify-center gap-2
                    ${
                      (currState === "Sign Up" && !termsAccepted) || isLoading
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 hover:shadow-md"
                    }`}
                  disabled={
                    (currState === "Sign Up" && !termsAccepted) || isLoading
                  }
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>
                        {currState === "Sign Up"
                          ? isDataSubmitted
                            ? "Registering..."
                            : "Processing..."
                          : "Signing in..."}
                      </span>
                    </>
                  ) : (
                    <>
                      {currState === "Sign Up"
                        ? isDataSubmitted
                          ? "Complete Registration"
                          : "Continue"
                        : "Sign In"}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </>
                  )}
                </motion.button>
              </form>

              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {currState === "Sign Up" ? (
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        setCurrState("Sign In");
                        setIsDataSubmitted(false);
                      }}
                      className="text-blue-600 font-medium hover:underline transition-colors"
                    >
                      Sign in here
                    </button>
                  </p>
                ) : (
                  <p className="text-gray-600">
                    Don't have an account?{" "}
                    <button
                      onClick={() => setCurrState("Sign Up")}
                      className="text-blue-600 font-medium hover:underline transition-colors"
                    >
                      Register now
                    </button>
                  </p>
                )}
              </motion.div>

              {/* Enhanced Security Badge */}
              <motion.div
                className="mt-10 pt-6 border-t border-gray-100 flex flex-col items-center gap-2 text-gray-500 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">256-bit SSL encryption</span>
                </div>
                <p className="text-xs text-gray-400">
                  Your data is securely protected
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
