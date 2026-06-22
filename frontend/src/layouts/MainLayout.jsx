// MainLayout.jsx
// MainLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#F9FAFB] m-0 p-0">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
}
// import { Outlet } from "react-router-dom";
// import Navbar from "../components/Navbar";

// export default function MainLayout() {
//   return (
//     <div className="min-h-screen bg-[#F9FAFB]">
//       <Navbar />
//       <main>
//         <Outlet />
//       </main>
//     </div>
//   );
// }
