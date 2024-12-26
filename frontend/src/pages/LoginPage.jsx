import { useState } from "react";
import Input from "../components/Input";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authStore } from "../stores/authStore";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, error, isLoading } = authStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      const { user } = authStore.getState();
      if (user?.role) {
        if (user.role === "Applicant") {
          navigate("/applicant");
        } else if (user.role === "Employer") {
          navigate("/employer");
        }
      }
      toast.success("Login successfully");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to bg-emerald-500 text-transparent bg-clip-text">
            Welcome Back
          </h2>
          <form onSubmit={handleLogin}>
            <Input
              icon={Mail}
              type="email;"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="">
              <Link
                to={"/forgot-password"}
                className="text-green-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            {error && (
              <p className="text-red-500 font-semibold mt-2">{error}</p>
            )}

            <motion.button
              className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                "Login"
              )}
            </motion.button>
          </form>
        </div>
        <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
          <p className="text-sm text-gray-400">
            Don't have an account? {""}
            <Link to={"/"} className="text-green-400 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;