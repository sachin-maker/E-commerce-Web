const mongoose = require("mongoose");
const Address = require("../models/addressModel");

const ALLOWED_LABELS = ["HOME", "WORK", "OTHER"];

const normalizeAddressInput = (body = {}) => {
  const address = {
    label:
      typeof body.label === "string"
        ? body.label.trim().toUpperCase()
        : undefined,

    fullName:
      typeof body.fullName === "string" ? body.fullName.trim() : undefined,

    phone: typeof body.phone === "string" ? body.phone.trim() : undefined,

    addressLine:
      typeof body.addressLine === "string"
        ? body.addressLine.trim()
        : undefined,

    city: typeof body.city === "string" ? body.city.trim() : undefined,

    state: typeof body.state === "string" ? body.state.trim() : undefined,

    postalCode:
      typeof body.postalCode === "string"
        ? body.postalCode.trim()
        : undefined,

    isDefault:
      typeof body.isDefault === "boolean" ? body.isDefault : undefined,
  };

  return Object.fromEntries(
    Object.entries(address).filter(([, value]) => value !== undefined)
  );
};

/*
 * GET /api/users/addresses
 *
 * Get all addresses belonging to the authenticated user.
 */
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user.userId,
    }).sort({
      isDefault: -1,
      updatedAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    });
  }
};

/*
 * POST /api/users/addresses
 *
 * Create a new address.
 */
const createAddress = async (req, res) => {
  try {
    const addressData = normalizeAddressInput(req.body);

    if (
      !addressData.fullName ||
      !addressData.phone ||
      !addressData.addressLine ||
      !addressData.city ||
      !addressData.state ||
      !addressData.postalCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete address is required",
      });
    }

    if (
      addressData.label !== undefined &&
      !ALLOWED_LABELS.includes(addressData.label)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid address label",
      });
    }

    /*
     * If this is the first address, automatically make it default.
     *
     * This avoids leaving a user without a default address.
     */
    const existingAddressCount = await Address.countDocuments({
      user: req.user.userId,
    });

    if (existingAddressCount === 0) {
      addressData.isDefault = true;
    }

    /*
     * If the new address is marked as default,
     * remove default status from existing addresses first.
     */
    if (addressData.isDefault === true) {
      await Address.updateMany(
        {
          user: req.user.userId,
          isDefault: true,
        },
        {
          $set: {
            isDefault: false,
          },
        }
      );
    }

    const address = await Address.create({
      ...addressData,
      user: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    console.error("Create address error:", error);

    if (error.name === "ValidationError") {
      const firstValidationError = Object.values(error.errors)[0];

      return res.status(400).json({
        success: false,
        message:
          firstValidationError?.message || "Invalid address information",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add address",
    });
  }
};

/*
 * PATCH /api/users/addresses/:id
 *
 * Update an address belonging to the authenticated user.
 */
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    const addressData = normalizeAddressInput(req.body);

    if (Object.keys(addressData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No address changes provided",
      });
    }

    if (
      addressData.label !== undefined &&
      !ALLOWED_LABELS.includes(addressData.label)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid address label",
      });
    }

    const existingAddress = await Address.findOne({
      _id: id,
      user: req.user.userId,
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    /*
     * If the user is making this address the default,
     * remove default status from all other addresses.
     */
    if (addressData.isDefault === true) {
      await Address.updateMany(
        {
          user: req.user.userId,
          _id: { $ne: id },
          isDefault: true,
        },
        {
          $set: {
            isDefault: false,
          },
        }
      );
    }

    Object.assign(existingAddress, addressData);

    await existingAddress.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: existingAddress,
    });
  } catch (error) {
    console.error("Update address error:", error);

    if (error.name === "ValidationError") {
      const firstValidationError = Object.values(error.errors)[0];

      return res.status(400).json({
        success: false,
        message:
          firstValidationError?.message || "Invalid address information",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};

/*
 * DELETE /api/users/addresses/:id
 *
 * Delete an address belonging to the authenticated user.
 */
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    const address = await Address.findOne({
      _id: id,
      user: req.user.userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await Address.deleteOne({
      _id: id,
      user: req.user.userId,
    });

    /*
     * If the deleted address was the default address,
     * automatically promote the most recently updated
     * remaining address.
     */
    if (address.isDefault) {
      const nextAddress = await Address.findOne({
        user: req.user.userId,
      }).sort({
        updatedAt: -1,
      });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};

/*
 * PATCH /api/users/addresses/:id/default
 *
 * Make an address the user's default address.
 */
const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    const address = await Address.findOne({
      _id: id,
      user: req.user.userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    /*
     * Remove default status from all addresses
     * belonging to this user.
     */
    await Address.updateMany(
      {
        user: req.user.userId,
        _id: { $ne: id },
        isDefault: true,
      },
      {
        $set: {
          isDefault: false,
        },
      }
    );

    address.isDefault = true;

    await address.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Set default address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to set default address",
    });
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};