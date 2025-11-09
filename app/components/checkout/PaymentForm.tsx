"use client";
import { motion } from "framer-motion";
import { useState } from "react";

export default function PaymentForm() {
  const [formData, setFormData] = useState({
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    nameOnCard: "",
    discountCode: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19);
    }

    // Format expiration date as MM/YY
    if (name === "expirationDate") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .slice(0, 5);
    }

    // Limit CVV to 3 digits
    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-4"
    >
      {/* Card Number */}
      <div>
        <label
          htmlFor="cardNumber"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Card Number
        </label>
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type="text"
          id="cardNumber"
          name="cardNumber"
          value={formData.cardNumber}
          onChange={handleInputChange}
          placeholder="xxxx xxxx xxxx xxxx"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      </div>

      {/* Expiration Date and CVV */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label
            htmlFor="expirationDate"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Expiration Date
          </label>
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="text"
            id="expirationDate"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleInputChange}
            placeholder="MM/YY"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="cvv"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            CVV
          </label>
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="text"
            id="cvv"
            name="cvv"
            value={formData.cvv}
            onChange={handleInputChange}
            placeholder="xxx"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
      </div>

      {/* Name on Card */}
      <div>
        <label
          htmlFor="nameOnCard"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Name On Card
        </label>
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type="text"
          id="nameOnCard"
          name="nameOnCard"
          value={formData.nameOnCard}
          onChange={handleInputChange}
          placeholder="Enter your name"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      </div>

      {/* Discount Code */}
      <div>
        <label
          htmlFor="discountCode"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Discount Code
        </label>
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type="text"
          id="discountCode"
          name="discountCode"
          value={formData.discountCode}
          onChange={handleInputChange}
          placeholder="Enter discount code"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      </div>
    </motion.div>
  );
}
