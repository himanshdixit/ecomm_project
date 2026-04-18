"use client";

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, MapPin, Plus, Trash2, User2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { resolveMediaUrl, shouldBypassNextImageOptimization } from "@/lib/api-config";
import { accountProfileSchema, createAccountProfileDefaults, createEmptyDeliveryAddress } from "@/lib/validators/account";
import { cn } from "@/lib/utils";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";

const fieldClassName = "field-control rounded-[1rem] py-3 text-sm sm:rounded-[1.1rem]";

export default function AccountProfileForm({ user, isSaving, onSubmit, profileSectionId = "", addressesSectionId = "" }) {
  const [avatarFile, setAvatarFile] = useState(null);

  const form = useForm({
    resolver: zodResolver(accountProfileSchema),
    defaultValues: createAccountProfileDefaults(user),
  });
  const { control, formState: { errors }, getValues, handleSubmit, register, reset, setValue } = form;
  const { fields, append, replace } = useFieldArray({
    control,
    name: "deliveryAddresses",
  });

  useEffect(() => {
    reset(createAccountProfileDefaults(user));
  }, [reset, user]);

  const objectUrl = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : ""), [avatarFile]);

  useEffect(
    () => () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    },
    [objectUrl]
  );

  const watchedRemoveAvatar = useWatch({ control, name: "removeAvatar" });
  const watchedName = useWatch({ control, name: "name" });
  const watchedAddresses = useWatch({ control, name: "deliveryAddresses" }) || [];
  const previewSource = objectUrl || (watchedRemoveAvatar ? "" : resolveMediaUrl(user?.avatar || ""));
  const initials = useMemo(() => getInitials(watchedName || user?.name || ""), [watchedName, user?.name]);

  const setDefaultAddress = (targetIndex) => {
    const nextAddresses = getValues("deliveryAddresses").map((address, index) => ({
      ...address,
      isDefault: index === targetIndex,
    }));

    replace(nextAddresses);
  };

  const handleRemoveAddress = (index) => {
    if (fields.length === 1) {
      replace([{ ...createEmptyDeliveryAddress(), fullName: getValues("name"), phone: getValues("phone") }]);
      return;
    }

    const nextAddresses = getValues("deliveryAddresses").filter((_, currentIndex) => currentIndex !== index);

    if (!nextAddresses.some((address) => address.isDefault) && nextAddresses[0]) {
      nextAddresses[0].isDefault = true;
    }

    replace(nextAddresses);
  };

  const handleAddAddress = () => {
    if (fields.length >= 5) {
      return;
    }

    append({
      ...createEmptyDeliveryAddress(),
      label: `Address ${fields.length + 1}`,
      fullName: getValues("name") || "",
      phone: getValues("phone") || "",
      isDefault: fields.length === 0,
    });
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0] || null;
    setAvatarFile(file);

    if (file) {
      setValue("removeAvatar", false, { shouldDirty: true });
    }

    event.target.value = "";
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setValue("removeAvatar", true, { shouldDirty: true });
  };

  const handleReset = () => {
    reset(createAccountProfileDefaults(user));
    setAvatarFile(null);
  };

  const submitForm = handleSubmit(async (values) => {
    await onSubmit(values, avatarFile);
    setAvatarFile(null);
  });

  return (
    <form onSubmit={submitForm} className="space-y-5">
      <section id={profileSectionId || undefined} className="surface-card scroll-mt-28 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Account details</div>
            <h2 className="text-2xl">Update your profile</h2>
            <p className="text-sm leading-6 text-slate-500">Keep your delivery identity, contact number, and primary address current for faster checkout.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.4rem] border border-slate-200 bg-slate-100 text-2xl font-semibold text-slate-500 shadow-soft">
              {previewSource ? (
                <Image
                  src={previewSource}
                  alt={user?.name || "Profile"}
                  fill
                  className="object-cover"
                  unoptimized={shouldBypassNextImageOptimization(previewSource)}
                />
              ) : (
                initials
              )}
            </div>
            <div className="space-y-2">
              <label className="button-secondary cursor-pointer px-4 py-2.5 text-sm">
                <ImagePlus className="h-4 w-4" />
                Change photo
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={handleAvatarChange} />
              </label>
              {(previewSource || user?.avatar) ? (
                <button type="button" onClick={handleRemoveAvatar} className="button-secondary px-4 py-2.5 text-sm text-rose-600">
                  Remove photo
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Full name</label>
            <input {...register("name")} className={fieldClassName} placeholder="Enter your name" />
            {errors.name ? <p className="mt-2 text-sm text-rose-600">{errors.name.message}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Phone number</label>
            <input {...register("phone")} className={fieldClassName} placeholder="+91 98XXXXXXXX" />
            {errors.phone ? <p className="mt-2 text-sm text-rose-600">{errors.phone.message}</p> : null}
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Email address</label>
            <input value={user?.email || ""} readOnly className={cn(fieldClassName, "cursor-not-allowed bg-slate-50 text-slate-500")} />
          </div>
        </div>
      </section>

      <section id={addressesSectionId || undefined} className="surface-card scroll-mt-28 p-5 sm:p-6">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Delivery addresses</div>
            <h2 className="mt-2 text-2xl">Saved locations</h2>
          </div>
          <button type="button" onClick={handleAddAddress} disabled={fields.length >= 5} className="button-secondary px-4 py-2.5 text-sm disabled:opacity-50">
            <Plus className="h-4 w-4" />
            Add address
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {fields.map((field, index) => {
            const addressError = errors.deliveryAddresses?.[index];
            const watchedAddress = watchedAddresses[index] || {};
            const isDefault = Boolean(watchedAddress.isDefault);
            const addressLabel = watchedAddress.label || `Address ${index + 1}`;

            return (
              <div key={field.id} className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1195e8] shadow-soft">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{addressLabel}</div>
                      <div className="text-xs text-slate-500">Used for checkout and delivery updates</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setDefaultAddress(index)} className={cn("button-secondary px-3.5 py-2 text-xs", isDefault ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "")}>
                      {isDefault ? "Default address" : "Make default"}
                    </button>
                    <button type="button" onClick={() => handleRemoveAddress(index)} className="button-secondary px-3.5 py-2 text-xs text-rose-600">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Label</label>
                    <input {...register(`deliveryAddresses.${index}.label`)} className={fieldClassName} placeholder="Home, Work..." />
                    {addressError?.label ? <p className="mt-2 text-sm text-rose-600">{addressError.label.message}</p> : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Recipient name</label>
                    <input {...register(`deliveryAddresses.${index}.fullName`)} className={fieldClassName} placeholder="Who receives this order?" />
                    {addressError?.fullName ? <p className="mt-2 text-sm text-rose-600">{addressError.fullName.message}</p> : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Phone</label>
                    <input {...register(`deliveryAddresses.${index}.phone`)} className={fieldClassName} placeholder="Phone for delivery updates" />
                    {addressError?.phone ? <p className="mt-2 text-sm text-rose-600">{addressError.phone.message}</p> : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Country</label>
                    <input {...register(`deliveryAddresses.${index}.country`)} className={fieldClassName} placeholder="India" />
                    {addressError?.country ? <p className="mt-2 text-sm text-rose-600">{addressError.country.message}</p> : null}
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Address line 1</label>
                    <input {...register(`deliveryAddresses.${index}.addressLine1`)} className={fieldClassName} placeholder="House / flat / street" />
                    {addressError?.addressLine1 ? <p className="mt-2 text-sm text-rose-600">{addressError.addressLine1.message}</p> : null}
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Address line 2</label>
                    <input {...register(`deliveryAddresses.${index}.addressLine2`)} className={fieldClassName} placeholder="Apartment, tower, floor..." />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">City</label>
                    <input {...register(`deliveryAddresses.${index}.city`)} className={fieldClassName} placeholder="City" />
                    {addressError?.city ? <p className="mt-2 text-sm text-rose-600">{addressError.city.message}</p> : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">State</label>
                    <input {...register(`deliveryAddresses.${index}.state`)} className={fieldClassName} placeholder="State" />
                    {addressError?.state ? <p className="mt-2 text-sm text-rose-600">{addressError.state.message}</p> : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Postal code</label>
                    <input {...register(`deliveryAddresses.${index}.postalCode`)} className={fieldClassName} placeholder="Postal code" />
                    {addressError?.postalCode ? <p className="mt-2 text-sm text-rose-600">{addressError.postalCode.message}</p> : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Landmark</label>
                    <input {...register(`deliveryAddresses.${index}.landmark`)} className={fieldClassName} placeholder="Optional landmark" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Delivery instructions</label>
                    <textarea {...register(`deliveryAddresses.${index}.instructions`)} rows={3} className={fieldClassName} placeholder="Gate code, ring bell, security desk notes..." />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={handleReset} className="button-secondary px-5 py-3 text-sm">
          Reset changes
        </button>
        <button type="submit" disabled={isSaving} className="button-primary px-5 py-3 text-sm">
          <User2 className="h-4 w-4" />
          {isSaving ? "Saving profile..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}
