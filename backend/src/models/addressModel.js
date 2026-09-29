const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    label: {
      type: String,
      enum: ["HOME", "WORK", "OTHER"],
      default: "HOME",
      trim: true,
    },

    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must contain at least 2 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        "Please provide a valid 10-digit Indian phone number",
      ],
    },

    addressLine: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [5, "Address must contain at least 5 characters"],
      maxlength: [200, "Address cannot exceed 200 characters"],
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      minlength: [2, "City must contain at least 2 characters"],
      maxlength: [100, "City cannot exceed 100 characters"],
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      minlength: [2, "State must contain at least 2 characters"],
      maxlength: [100, "State cannot exceed 100 characters"],
    },

    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true,
      match: [/^\d{6}$/, "Please provide a valid 6-digit postal code"],
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

addressSchema.index({ user: 1, isDefault: 1 });

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;