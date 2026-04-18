import { z } from "zod";

export const deliveryAddressSchema = z.object({
  id: z.string().optional().default(""),
  label: z.string().trim().min(1, "Label is required.").max(30, "Keep the label short."),
  fullName: z.string().trim().min(2, "Recipient name is required."),
  phone: z.string().trim().min(10, "Phone number is required."),
  addressLine1: z.string().trim().min(5, "Address line 1 is required."),
  addressLine2: z.string().trim().optional().default(""),
  city: z.string().trim().min(2, "City is required."),
  state: z.string().trim().min(2, "State is required."),
  postalCode: z.string().trim().min(4, "Postal code is required."),
  country: z.string().trim().min(2, "Country is required.").default("India"),
  landmark: z.string().trim().optional().default(""),
  instructions: z.string().trim().optional().default(""),
  isDefault: z.boolean().default(false),
});

export const accountProfileSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  phone: z.string().trim().optional().default(""),
  removeAvatar: z.boolean().default(false),
  deliveryAddresses: z.array(deliveryAddressSchema).max(5, "You can save up to 5 addresses."),
});

export const createEmptyDeliveryAddress = () => ({
  id: "",
  label: "Home",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  landmark: "",
  instructions: "",
  isDefault: true,
});

export const createAccountProfileDefaults = (user) => {
  const deliveryAddresses = Array.isArray(user?.deliveryAddresses) && user.deliveryAddresses.length
    ? user.deliveryAddresses.map((address, index) => ({
        id: address.id || "",
        label: address.label || (index === 0 ? "Home" : `Address ${index + 1}`),
        fullName: address.fullName || user?.name || "",
        phone: address.phone || user?.phone || "",
        addressLine1: address.addressLine1 || "",
        addressLine2: address.addressLine2 || "",
        city: address.city || "",
        state: address.state || "",
        postalCode: address.postalCode || "",
        country: address.country || "India",
        landmark: address.landmark || "",
        instructions: address.instructions || "",
        isDefault: Boolean(address.isDefault),
      }))
    : [];

  if (!deliveryAddresses.length) {
    deliveryAddresses.push({
      ...createEmptyDeliveryAddress(),
      fullName: user?.name || "",
      phone: user?.phone || "",
    });
  }

  if (!deliveryAddresses.some((address) => address.isDefault)) {
    deliveryAddresses[0].isDefault = true;
  }

  return {
    name: user?.name || "",
    phone: user?.phone || "",
    removeAvatar: false,
    deliveryAddresses,
  };
};
