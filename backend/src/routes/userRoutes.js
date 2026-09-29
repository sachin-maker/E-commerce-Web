const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/userController");

const {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/addressController");

const router = express.Router();

/*
 * All user routes require authentication.
 */
router.use(protect);

/*
 * Profile
 */
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.patch("/profile/password", changePassword);

/*
 * Addresses
 */
router.get("/addresses", getAddresses);
router.post("/addresses", createAddress);
router.patch("/addresses/:id", updateAddress);
router.delete("/addresses/:id", deleteAddress);
router.patch("/addresses/:id/default", setDefaultAddress);

module.exports = router;