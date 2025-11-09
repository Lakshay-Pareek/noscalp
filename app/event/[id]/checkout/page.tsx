"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import ProgressStepper from "@/app/components/event/ProgressStepper";
import YourTicketList from "@/app/components/checkout/YourTicketList";
import PaymentDetails from "@/app/components/checkout/PaymentDetails";
import CountdownTimer from "@/app/components/checkout/CountdownTimer";
import Footer from "@/app/components/Footer";
import { SelectedTicket } from "@/app/types/seat";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch selected tickets from sessionStorage
    const storedTickets = sessionStorage.getItem("selectedTickets");
    if (storedTickets) {
      try {
        const tickets = JSON.parse(storedTickets);
        setSelectedTickets(tickets);
      } catch (error) {
        console.error("Error parsing tickets:", error);
        router.push(`/event/${eventId}/seats`);
      }
    } else {
      // No tickets found, redirect back to seat selection
      router.push(`/event/${eventId}/seats`);
    }
    setIsLoading(false);
  }, [eventId, router]);

  const handlePayment = () => {
    // Prepare purchase data for success page
    const purchaseData = {
      tickets: selectedTickets,
      totalAmount: subtotal + totalServiceFees,
      purchaseDate: new Date().toISOString(),
    };

    // Store purchase data in sessionStorage
    sessionStorage.setItem("purchaseData", JSON.stringify(purchaseData));

    // Clear selected tickets
    sessionStorage.removeItem("selectedTickets");

    // Redirect to success page
    router.push(`/event/${eventId}/success`);
  };

  const subtotal = selectedTickets.reduce(
    (sum, ticket) => sum + ticket.tier.price,
    0
  );
  const serviceFeePerTicket = 1.0;
  const totalServiceFees = selectedTickets.length * serviceFeePerTicket;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </motion.div>
      </div>
    );
  }

  if (selectedTickets.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar with gradient background */}
      <div className="relative z-10">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('/Hero/background.png')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "top",
          }}
        />
        <div className="absolute inset-0 z-10 bg-linear-to-br from-[#ED4690] to-[#5522CC] opacity-90" />
        <div className="relative z-20">
          <Navbar />
        </div>
      </div>

      {/* Progress Stepper */}
      <ProgressStepper currentStep={3} />

      {/* Main Content */}
      <div className="mx-auto max-w-[1180px] px-4 md:py-8 py-2 sm:px-6 lg:px-8">
        {/* Page Header with Countdown */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:mb-8 mb-4 flex flex-col items-center justify-between md:gap-4 gap-2 sm:flex-row"
        >
          <h1 className="text-xl font-bold text-gray-900 sm:text-3xl">
            Checkout
          </h1>
          <CountdownTimer initialMinutes={5} initialSeconds={12} />
        </motion.div>

        <p className="mb-8 text-center text-sm text-gray-600 sm:text-left">
          Fill Out Necessary Information here.
        </p>

        {/* Two Column Layout - Responsive */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* Left Column - Ticket List */}
          <div className="w-full lg:w-[45%]">
            <YourTicketList tickets={selectedTickets} />
          </div>

          {/* Right Column - Payment Details */}
          <div className="w-full lg:flex-1">
            <PaymentDetails
              subtotal={subtotal}
              serviceFee={totalServiceFees}
              itemCount={selectedTickets.length}
              onPayment={handlePayment}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}
