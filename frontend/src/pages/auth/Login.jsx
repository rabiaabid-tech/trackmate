import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { useState, useEffect } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;

      // 🚨 PAYLOAD YAHAN FIX KARO: backend "id_token_str" mang raha hai
      const res = await axios.post("/auth/google", {
        id_token_str: idToken,
      });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data));

      if (res.data.is_admin) {
        navigate("/admin/users");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login Failed:", err.response?.data?.detail || err.message);
      // Backend se jo error message aaye wahi dikhao
      setErrorMsg(err.response?.data?.detail || "Authentication Failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1F4D] flex items-center justify-center relative overflow-hidden px-6">
      {/* 🌌 Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-10 md:p-14 rounded-[3rem] shadow-2xl text-center">
          {/* Logo Icon */}
          <div className="w-20 h-20 bg-gradient-to-tr from-[#D4AF37] to-[#f2cf65] rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-lg shadow-[#D4AF37]/20 rotate-3 hover:rotate-0 transition-transform duration-500">
            🔎
          </div>

          {/* Branding */}
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">
            Track<span className="text-[#D4AF37]">Mate</span>
          </h1>
          <p className="text-blue-100/60 text-sm font-medium mb-12">
            The Smart Lost & Found Hub for <br />
            <span className="text-white font-bold italic">
              University of Gujrat
            </span>
          </p>

          {/* Login Container */}
          <div className="bg-white p-8 rounded-[2rem] shadow-xl">
            <h2 className="text-[#0B1F4D] text-xs font-black uppercase tracking-[0.2em] mb-6">
              Secure Access
            </h2>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() =>
                  setErrorMsg("Google Login Failed. Please try again.")
                } // 🚨 REPLACED alert()
                theme="filled_blue"
                shape="pill"
                size="large"
                text="continue_with"
              />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-[9px] text-gray-400 font-bold tracking-[0.15em] uppercase leading-relaxed">
                Login with your <br />
                <span className="text-[#0B1F4D]">Official UOG Student ID</span>
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <p className="mt-10 text-white/30 text-[10px] font-medium uppercase tracking-widest">
            Developed for FYP 2026 • Secure OAuth 2.0
          </p>
        </div>
      </div>

      {/* 🚨 PREMIUM ERROR MODAL 🚨 */}
      {errorMsg && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B1F4D]/90 backdrop-blur-sm p-4"
          onClick={() => setErrorMsg("")}
        >
          <div
            className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center border border-red-100 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner bg-red-50 text-red-600">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-2xl font-black text-[#0B1F4D] mb-2 uppercase tracking-tighter">
              Access Denied
            </h3>
            <p className="text-gray-500 text-sm font-bold mb-8 leading-relaxed">
              {errorMsg}
            </p>

            <button
              onClick={() => setErrorMsg("")}
              className="w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-md bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// import { GoogleLogin } from "@react-oauth/google";
// import { useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { loginWithGoogle } from "../../api/authApi";

// export default function Login() {
//   const navigate = useNavigate();
//   const [errorMsg, setErrorMsg] = useState("");

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       navigate("/", { replace: true });
//     }
//   }, [navigate]);

//   const handleGoogleSuccess = async (credentialResponse) => {
//     try {
//       const idToken = credentialResponse.credential;

//       // 🚨 UPDATED LOGIC: Use the centralized API call
//       const res = await loginWithGoogle(idToken);

//       localStorage.setItem("token", res.data.access_token);
//       localStorage.setItem("user", JSON.stringify(res.data));

//       if (res.data.is_admin) {
//         navigate("/admin/users");
//       } else {
//         navigate("/");
//       }
//     } catch (err) {
//       console.error("Login Failed:", err.response?.data?.detail || err.message);
//       setErrorMsg(err.response?.data?.detail || "Authentication Failed.");
//     }
//   };
//  console.log("Login Component is rendering...");
//   return (
//     <div className="min-h-screen bg-[#0B1F4D] flex items-center justify-center relative overflow-hidden px-6">
//       {/* 🌌 Animated Background Elements */}
//       <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/10 rounded-full blur-[120px] animate-pulse"></div>
//       <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]"></div>

//       <div className="max-w-md w-full relative z-10">
//         <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-10 md:p-14 rounded-[3rem] shadow-2xl text-center">
//           {/* Logo Icon */}
//           <div className="w-20 h-20 bg-gradient-to-tr from-[#D4AF37] to-[#f2cf65] rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-lg shadow-[#D4AF37]/20 rotate-3 hover:rotate-0 transition-transform duration-500">
//             🔎
//           </div>

//           {/* Branding */}
//           <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">
//             Track<span className="text-[#D4AF37]">Mate</span>
//           </h1>
//           <p className="text-blue-100/60 text-sm font-medium mb-12">
//             The Smart Lost & Found Hub for <br />
//             <span className="text-white font-bold italic">
//               University of Gujrat
//             </span>
//           </p>

//           {/* Login Container */}
//           <div className="bg-white p-8 rounded-[2rem] shadow-xl">
//             <h2 className="text-[#0B1F4D] text-xs font-black uppercase tracking-[0.2em] mb-6">
//               Secure Access
//             </h2>

//             <div className="flex justify-center">
//               <GoogleLogin
//                 onSuccess={handleGoogleSuccess}
//                 onError={() =>
//                   setErrorMsg("Google Login Failed. Please try again.")
//                 }
//                 theme="filled_blue"
//                 shape="pill"
//                 size="large"
//                 text="continue_with"
//               />
//             </div>

//             <div className="mt-8 pt-6 border-t border-gray-100">
//               <p className="text-[9px] text-gray-400 font-bold tracking-[0.15em] uppercase leading-relaxed">
//                 Login with your <br />
//                 <span className="text-[#0B1F4D]">Official UOG Student ID</span>
//               </p>
//             </div>
//           </div>

//           {/* Footer Info */}
//           <p className="mt-10 text-white/30 text-[10px] font-medium uppercase tracking-widest">
//             Developed for FYP 2026 • Secure OAuth 2.0
//           </p>
//         </div>
//       </div>

//       {/* 🚨 PREMIUM ERROR MODAL 🚨 */}
//       {errorMsg && (
//         <div
//           className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B1F4D]/90 backdrop-blur-sm p-4"
//           onClick={() => setErrorMsg("")}
//         >
//           <div
//             className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center border border-red-100 transform transition-all scale-100"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner bg-red-50 text-red-600">
//               <svg
//                 className="w-8 h-8"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2.5}
//                   d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
//                 />
//               </svg>
//             </div>

//             <h3 className="text-2xl font-black text-[#0B1F4D] mb-2 uppercase tracking-tighter">
//               Access Denied
//             </h3>
//             <p className="text-gray-500 text-sm font-bold mb-8 leading-relaxed">
//               {errorMsg}
//             </p>

//             <button
//               onClick={() => setErrorMsg("")}
//               className="w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-md bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
//             >
//               Dismiss
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
