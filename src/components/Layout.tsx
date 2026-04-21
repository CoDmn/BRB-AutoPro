import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Chatbot from "./Chatbot";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
}
