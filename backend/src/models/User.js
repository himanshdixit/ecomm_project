import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const deliveryAddressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "Home",
      trim: true,
    },
    fullName: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    addressLine1: {
      type: String,
      default: "",
      trim: true,
    },
    addressLine2: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    postalCode: {
      type: String,
      default: "",
      trim: true,
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
    landmark: {
      type: String,
      default: "",
      trim: true,
    },
    instructions: {
      type: String,
      default: "",
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const ensureSingleDefaultAddress = (addresses = []) => {
  if (!Array.isArray(addresses) || !addresses.length) {
    return;
  }

  let defaultFound = false;

  addresses.forEach((address, index) => {
    if (!defaultFound && address.isDefault) {
      defaultFound = true;
      address.isDefault = true;
      return;
    }

    if (defaultFound) {
      address.isDefault = false;
      return;
    }

    if (index === 0) {
      address.isDefault = true;
      defaultFound = true;
    }
  });
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
    },
    rewardCoins: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCoinsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryAddresses: {
      type: [deliveryAddressSchema],
      default: [],
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variantId: {
          type: String,
          default: "",
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("validate", function normalizeUserProfile(next) {
  ensureSingleDefaultAddress(this.deliveryAddresses);
  next();
});

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
