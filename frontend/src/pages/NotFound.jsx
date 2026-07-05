import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <p className="text-8xl font-bold text-surface-700 select-none">404</p>
        <h1 className="text-2xl font-bold text-white mt-4">Page not found</h1>
        <p className="text-gray-400 mt-2 max-w-xs">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/" className="btn-primary mt-8 px-8">
          Go home
        </Link>
      </div>
    </div>
  );
}
