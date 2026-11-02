import LookupForm from "@/components/LookupForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto p-4 sm:p-8 min-h-screen flex flex-col">
      <div className="flex-1">
        <LookupForm />
      </div>
      <Footer />
    </main>
  );
}
