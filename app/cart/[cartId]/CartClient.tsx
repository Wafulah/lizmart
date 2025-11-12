"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { Cart } from "@/lib/neondb/types";
import Image from "next/image";

import AddressForm from "./AddressForm";

interface CartClientProps {
  cart?: Cart;
  userId?: string | null;
}

export default function CartClient({ cart, userId }: CartClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State to track whether address form should be shown
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Clear cart function placeholder
  const removeAll = async () => {
    // TODO: call your API or clear via context/prisma etc.
    // e.g. await fetch("/api/cart/clear", { method: "POST" });
    // Then maybe route to home or show something
  };

  // Check for success / canceled in URL params
  useEffect(() => {
    if (searchParams.get("success")) {
      toast.success("Payment completed.");
      removeAll();
    }
    if (searchParams.get("canceled")) {
      toast.error("Something went wrong.");
    }
  }, [searchParams]);

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Button onClick={() => router.push("/")}>Continue Shopping</Button>
      </div>
    );
  }

  const WHATSAPP_PHONE_NUMBER = "254117505979";
  // **NEW: Function to handle WhatsApp order**
  const handleWhatsappOrder = () => {
    if (!cart) return;

    // 1. Construct the order items list with standard newlines (\n)
    const orderItems = cart.lines
      .map((line) => {
        const title = line.merchandise.product.title;
        const options = line.merchandise.selectedOptions
          ?.map((opt) => `${opt.name}: ${opt.value}`)
          .join(", ");
        const quantity = line.quantity;
        const price = `${line.cost.totalAmount.amount} ${line.cost.totalAmount.currencyCode}`;
        return `- ${title}${options ? ` (${options})` : ""} x ${quantity} (${price})`;
      })
      .join("\n");

    const total = `${cart.cost.totalAmount.amount} ${cart.cost.totalAmount.currencyCode}`;

    // 2. Construct the full message string using standard newlines (\n)
    // The * will be preserved as bold in WhatsApp since we encode the whole string later
    const rawMessage = `Hello, I'd like to place an order!

*My Cart Details:*
${orderItems}

*Total Amount:* ${total}

*Please send me a payment link / details.*`;
    
    // 3. Encode the ENTIRE raw message for the URL
    const encodedMessage = encodeURIComponent(rawMessage);

    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodedMessage}`;

    // Open WhatsApp link in a new tab
    window.open(whatsappUrl, "_blank");
  };


  // Handle address form submission
  const handleAddressSubmit = async (data: {
  fullName: string;
  email?: string;
  phone: string;
  county: string;
  town: string;
  mpesaNumber: string;
}) => {
  try {
    const cartId = cart?.id;
    if (!cartId) {
      toast.error("Cart ID missing");
      return;
    }

    const response = await fetch(`/api/admin/checkout/cart/${cartId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  ...data,
  userId, 
}),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      toast.error(json.message || "Checkout failed.");
      return;
    }

    // If redirectUrl present, navigate to it
    if (json.redirectUrl) {
      window.location.href = json.redirectUrl;
      return;
    }

    //else, navigate to orders page
    router.push(`orders`);
  } catch (err) {
    console.error("Error in handleAddressSubmit:", err);
    toast.error("Something went wrong during checkout.");
  }
};

  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Cart lines review */}
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Your Cart</h1>
        {cart.lines.map((line, idx) => (
          <Card key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
            <CardContent className="flex-1 flex gap-4">
              {line.merchandise.product.images?.[0] && (
                <Image
                  src={line.merchandise.product.images[0].url}
                  alt={line.merchandise.product.title}
                  width={100}
                  height={100}
                  className="rounded object-cover"
                />
              )}
              <div className="flex-1 flex flex-col space-y-1">
                <div className="font-medium text-lg">{line.merchandise.product.title}</div>
                {line.merchandise.selectedOptions?.map((opt) => (
                  <div key={opt.name} className="text-sm text-muted-foreground">
                    {opt.name}: {opt.value}
                  </div>
                ))}
                <div className="mt-2 text-sm text-muted-foreground">
                  Quantity: {line.quantity}
                </div>
              </div>
            </CardContent>
            <div className="p-4 sm:ml-4 font-semibold text-lg">
              {line.cost.totalAmount.amount} {line.cost.totalAmount.currencyCode}
            </div>
          </Card>
        ))}
      </div>

      {/* Right: Summary + AddressForm or Pay Now */}
      <div className="w-full max-w-md flex-shrink-0 space-y-8">
        {/* If address form not shown yet, show summary + button to show it */}
        {!showAddressForm ? (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Order Summary</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {cart.cost.subtotalAmount.amount} {cart.cost.subtotalAmount.currencyCode}
                </span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>
                  {cart.cost.totalAmount.amount} {cart.cost.totalAmount.currencyCode}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flx flex-col gap-4">
  <Button
    className="w-full"
    onClick={() => {
      if (!userId) {
        
        toast.error("Please log in to continue checkout.");
        router.push("/dashboard/login");
        return;
      }
      setShowAddressForm(true);
    }}
  >
    Enter Address & Pay
  </Button>
  <Button
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                onClick={handleWhatsappOrder}
              >
                Order via WhatsApp
              </Button>
</CardFooter>
          </Card>
        ) : userId ? (
  <AddressForm cart={cart} onSubmit={handleAddressSubmit} />
) : (
  <div className="text-center space-y-4">
    <p className="text-lg">Please log in to proceed with checkout. This helps us Keep your information safe and provide seamless user Experience.</p>
    <Button onClick={() => router.push("/dashboard/login")}>Login</Button>
  </div>
)}
      </div>
    </div>
  );
}
