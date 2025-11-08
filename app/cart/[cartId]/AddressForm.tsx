import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { countiesList, getSubCountiesByCountyName } from "@/lib/counties-sub";

const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().min(1, "Phone is required"),
  county: z.string().min(1, "County is required"),
  town: z.string().min(1, "Town / Ward is required"),
  mpesaNumber: z.string().min(1, "MPESA number is required"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  cart: {
    cost: {
      subtotalAmount: { amount: string; currencyCode: string };
      totalAmount: { amount: string; currencyCode: string };
    };
  };
  onSubmit: (data: AddressFormValues) => void;
  
}

export default function AddressForm({ cart, onSubmit }: AddressFormProps) {
  const [subCounties, setSubCounties] = useState<{ id: string; name: string }[]>([]);
  const [loadingCounties, setLoadingCounties] = useState<boolean>(false);

  const counties = countiesList();
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      county: "",
      town: "",
      mpesaNumber: "",
    },
  });
  //

  const selectedCounty = form.watch("county");

  useEffect(() => {
    if (selectedCounty) {
      setLoadingCounties(true);
      const fetched = getSubCountiesByCountyName(selectedCounty);
      setSubCounties(fetched);
      setLoadingCounties(false);
    } else {
      setSubCounties([]);
    }
  }, [selectedCounty]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="pt-4">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Customer Details</h2>
            </CardHeader>
             <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (optional)</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="2547xxxxxxxx" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="county"
          render={({ field }) => (
            <FormItem>
              <FormLabel>County</FormLabel>
              <FormControl>
                <select
                  disabled={loadingCounties}
                  {...field}
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="">Select a county</option>
                  {counties.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="town"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Town / Ward</FormLabel>
              <FormControl>
                <select
                  disabled={loadingCounties || !selectedCounty}
                  {...field}
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="">Select town</option>
                  {subCounties.map((sc) => (
                    <option key={sc.id} value={sc.name}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mpesaNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>MPESA Number</FormLabel>
              <FormControl>
                <Input placeholder="2547xxxxxxxx" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         </CardContent>

        {/* Order Summary & Pay Now */}
        
          
            <CardHeader>
              <h2 className="text-xl font-bold">Order Summary</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {cart.cost.subtotalAmount.amount}{" "}
                  {cart.cost.subtotalAmount.currencyCode}
                </span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>
                  {cart.cost.totalAmount.amount}{" "}
                  {cart.cost.totalAmount.currencyCode}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Pay Now
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
}
