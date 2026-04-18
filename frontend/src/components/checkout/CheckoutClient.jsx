"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock3, CreditCard, MapPinHouse, ShieldCheck } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import EmptyState from "@/components/shared/EmptyState";
import { CheckoutSkeleton } from "@/components/shared/Skeletons";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency } from "@/lib/utils";
import { paymentService, orderService } from "@/services/api";
import { clearCart } from "@/store/slices/cartSlice";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phone: z.string().min(8, "Phone number is required."),
  addressLine1: z.string().min(5, "Street address is required."),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  postalCode: z.string().min(4, "Postal code is required."),
  country: z.string().min(2, "Country is required."),
  deliverySlot: z.string().min(1, "Choose a delivery slot."),
  paymentMethod: z.enum(["cod", "upi", "card", "paypal", "mock_pay"]),
  notes: z.string().optional(),
});

const deliverySlots = [
  "Deliver in 10-15 mins",
  "Schedule for 7:00 PM - 8:00 PM",
  "Schedule for tomorrow morning",
];

const paymentMethods = [
  { label: "Pay on delivery", value: "cod" },
  { label: "UPI / Wallet", value: "upi" },
  { label: "Credit / Debit card", value: "card" },
  { label: "PayPal", value: "paypal" },
  { label: "Mock Pay", value: "mock_pay" },
];

export default function CheckoutClient({ user }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);
  const [submitError, setSubmitError] = useState("");

  const defaultValues = useMemo(
    () => ({
      fullName: user.name || "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      deliverySlot: deliverySlots[0],
      paymentMethod: "cod",
      notes: "",
    }),
    [user.name]
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues,
  });

  const selectedPaymentMethod = useWatch({ control, name: "paymentMethod" });
  const selectedDeliverySlot = useWatch({ control, name: "deliverySlot" });

  if (cart.status === "idle" || (cart.status === "loading" && cart.items.length === 0)) {
    return <CheckoutSkeleton />;
  }

  if (!cart.items.length) {
    return (
      <main className="page-shell section-gap">
        <EmptyState
          title="Your cart is empty"
          description="Add products to your cart before starting checkout. Once items are in place, this form will create a real order in your backend."
          action={
            <Link href="/products" className="rounded-pill bg-brand-dark px-5 py-3 font-semibold text-white shadow-soft transition hover:-translate-y-0.5">
              Browse catalog
            </Link>
          }
        />
      </main>
    );
  }

  const onSubmit = async (values) => {
    setSubmitError("");

    try {
      let paymentResult;

      if (values.paymentMethod !== "cod") {
        paymentResult = await paymentService.createIntent({
          amount: cart.totalPrice,
          paymentMethod: values.paymentMethod,
        });
      }

      const order = await orderService.createOrder({
        shippingAddress: {
          fullName: values.fullName,
          phone: values.phone,
          addressLine1: values.addressLine1,
          addressLine2: values.addressLine2,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: values.country,
        },
        deliverySlot: values.deliverySlot,
        paymentMethod: values.paymentMethod,
        paymentResult,
        notes: values.notes,
      });

      const orderId = order?.id;
      dispatch(clearCart());
      router.replace(`/account/orders${orderId ? `?placed=${orderId}` : "?placed=1"}`);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Unable to complete checkout right now."));
    }
  };

  return (
    <main className="page-shell section-gap space-y-6">
      <div className="max-w-2xl space-y-3">
        <div className="pill-chip w-fit">Secure checkout</div>
        <h1 className="text-4xl sm:text-5xl">Checkout that keeps the rush calm.</h1>
        <p className="text-sm leading-7 text-slate-600 sm:text-base">
          Your shipping details, payment selection, and final order creation all go through the live backend flow now.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <section className="space-y-5">
          <div className="surface-card p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              <MapPinHouse className="h-4 w-4 text-brand" />
              Delivery address
            </div>
            <div className="mb-4 rounded-[1.35rem] bg-brand-soft/75 px-4 py-3 text-sm text-slate-600">
              Signed in as <span className="font-semibold text-brand-dark">{user.name}</span> ({user.email})
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input {...register("fullName")} className="rounded-2xl border border-brand/10 bg-brand-soft/70 px-4 py-3.5 outline-none focus:border-brand/30 focus:bg-white" placeholder="Full name" />
              <input {...register("phone")} className="rounded-2xl border border-brand/10 bg-brand-soft/70 px-4 py-3.5 outline-none focus:border-brand/30 focus:bg-white" placeholder="Phone number" />
              <input {...register("addressLine1")} className="rounded-2xl border border-brand/10 bg-brand-soft/70 px-4 py-3.5 outline-none focus:border-brand/30 focus:bg-white sm:col-span-2" placeholder="Street address" />
              <input {...register("addressLine2")} className="rounded-2xl border border-brand/10 bg-brand-soft/70 px-4 py-3.5 outline-none focus:border-brand/30 focus:bg-white sm:col-span-2" placeholder="Apartment, suite, landmark (optional)" />
              <input {...register("city")} className="rounded-2xl border border-brand/10 bg-brand-soft/70 px-4 py-3.5 outline-none focus:border-brand/30 focus:bg-white" placeholder="City" />
              <input {...register("state")} className="rounded-2xl border border-brand/10 bg-brand-soft/70 px-4 py-3.5 outline-none focus:border-brand/30 focus:bg-white" placeholder="State" />
              <input {...register("postalCode")} className="rounded-2xl border border-brand/10 bg-brand-soft/70 px-4 py-3.5 outline-none focus:border-brand/30 focus:bg-white" placeholder="Postal code" />
              <input {...register("country")} className="rounded-2xl border border-brand/10 bg-brand-soft/70 px-4 py-3.5 outline-none focus:border-brand/30 focus:bg-white" placeholder="Country" />
            </div>
            {Object.keys(errors).some((key) => ["fullName", "phone", "addressLine1", "city", "state", "postalCode", "country"].includes(key)) ? (
              <p className="mt-3 text-sm text-rose-500">Please fill in all required delivery details.</p>
            ) : null}
          </div>

          <div className="surface-card p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              <Clock3 className="h-4 w-4 text-brand" />
              Delivery slot
            </div>
            <div className="space-y-3">
              {deliverySlots.map((slot) => (
                <label key={slot} className={`flex cursor-pointer items-center gap-3 rounded-[1.35rem] border px-4 py-4 text-sm transition ${selectedDeliverySlot === slot ? "border-brand/30 bg-brand-soft text-brand-dark" : "border-brand/10 bg-white text-slate-600"}`}>
                  <input type="radio" value={slot} {...register("deliverySlot")} className="h-4 w-4 text-brand focus:ring-brand/30" />
                  {slot}
                </label>
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              <CreditCard className="h-4 w-4 text-brand" />
              Payment method
            </div>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label key={method.value} className={`flex cursor-pointer items-center gap-3 rounded-[1.35rem] border px-4 py-4 text-sm transition ${selectedPaymentMethod === method.value ? "border-brand/30 bg-brand-soft text-brand-dark" : "border-brand/10 bg-white text-slate-600"}`}>
                  <input type="radio" value={method.value} {...register("paymentMethod")} className="h-4 w-4 text-brand focus:ring-brand/30" />
                  {method.label}
                </label>
              ))}
            </div>
            <textarea {...register("notes")} rows={4} placeholder="Delivery notes (optional)" className="mt-4 w-full rounded-2xl border border-brand/10 bg-brand-soft/70 px-4 py-3.5 text-sm outline-none focus:border-brand/30 focus:bg-white" />
          </div>
        </section>

        <aside className="lg:sticky lg:top-36 lg:h-fit">
          <div className="surface-card p-6">
            <h2 className="mb-5 text-2xl">Summary</h2>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-brand-soft/60 px-4 py-3 text-sm text-slate-600">
                  <div>
                    <div className="font-semibold text-brand-dark">{item.name}</div>
                    <div>{item.quantity} x {item.unit}</div>
                  </div>
                  <div className="font-semibold text-brand-dark">{formatCurrency(item.lineTotal)}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-brand/10 pt-4 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery</span>
                <span>{cart.shippingPrice === 0 ? "Free" : formatCurrency(cart.shippingPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span>{formatCurrency(cart.taxPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-brand-dark">
                <span>Total</span>
                <span>{formatCurrency(cart.totalPrice)}</span>
              </div>
            </div>

            <div className="mt-5 rounded-[1.35rem] bg-brand-soft/75 px-4 py-3 text-sm text-slate-600">
              <ShieldCheck className="mb-2 h-5 w-5 text-brand" />
              Secure checkout with cookie-authenticated requests and centralized Axios error handling.
            </div>

            {submitError ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{submitError}</div> : null}

            <button type="submit" disabled={isSubmitting} className="mt-6 w-full rounded-pill bg-brand-dark px-5 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? "Placing order..." : "Place order"}
            </button>
          </div>
        </aside>
      </form>
    </main>
  );
}
