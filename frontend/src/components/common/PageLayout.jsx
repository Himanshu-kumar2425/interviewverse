import Navbar from "./Navbar.jsx";

export default function PageLayout({ children, className = "" }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
        {children}
      </main>
    </div>
  );
}
