"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { Check, Home, Briefcase, MapPin, Plus } from "lucide-react";

import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { clearCart } from "@/app/store/slices/cartSlice";

import {
  createOrder,
  type PaymentMethod,
} from "@/services/orderService";

import { apiRequest } from "@/lib/api";

import "./Checkout.css";

type PaymentOption = "COD";

type AddressLabel = "HOME" | "WORK" | "OTHER";

interface Address {
  _id: string;
  user: string;
  label: AddressLabel;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddressesResponse {
  success: boolean;
  count: number;
  addresses: Address[];
}

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  payment: PaymentOption;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  payment?: string;
  submit?: string;
}

const formatCurrency = (amount: number) =>
  `₹${amount.toFixed(2)}`;

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const getAddressIcon = (label: AddressLabel) => {
  if (label === "WORK") {
    return Briefcase;
  }

  return Home;
};

export default function CheckoutPage() {
  const dispatch = useAppDispatch();

  const cartItems = useAppSelector(
    (state) => state.cart.items
  );

  const token = useAppSelector(
    (state) => state.auth.token
  );

  const user = useAppSelector(
    (state) => state.auth.user
  );

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const [formData, setFormData] =
    useState<CheckoutFormData>({
      fullName: user?.name ?? "",
      email: user?.email ?? "",
      phone: "",
      addressLine: "",
      city: "",
      state: "",
      postalCode: "",
      payment: "COD",
    });

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isOrderPlaced, setIsOrderPlaced] =
    useState(false);

  const [orderId, setOrderId] =
    useState("");

  /*
   * Saved addresses
   */
  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [selectedAddressId, setSelectedAddressId] =
    useState<string | null>(null);

  const [isLoadingAddresses, setIsLoadingAddresses] =
    useState(true);

  const [addressLoadError, setAddressLoadError] =
    useState("");

  const [showManualAddressForm, setShowManualAddressForm] =
    useState(true);


  const [saveAddress, setSaveAddress] = useState(false);

  const [newAddressLabel, setNewAddressLabel] =
    useState<AddressLabel>("HOME");
  /*
   * Keep customer information synchronized
   * with authenticated user data.
   */
  useEffect(() => {
    setFormData((previousData) => ({
      ...previousData,
      fullName: previousData.fullName || user?.name || "",
      email: previousData.email || user?.email || "",
    }));
  }, [user]);

  /*
   * Load saved addresses.
   */
  const loadAddresses = useCallback(async () => {
    if (!token) {
      setIsLoadingAddresses(false);
      return;
    }

    try {
      setIsLoadingAddresses(true);
      setAddressLoadError("");

      const response =
        await apiRequest<AddressesResponse>(
          "/users/addresses",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const savedAddresses =
        response.addresses || [];

      setAddresses(savedAddresses);

      /*
       * Automatically select the default address.
       */
      const defaultAddress =
        savedAddresses.find(
          (address) => address.isDefault
        );

      if (defaultAddress) {
        setSelectedAddressId(
          defaultAddress._id
        );

        setFormData((previousData) => ({
          ...previousData,
          fullName: defaultAddress.fullName,
          phone: defaultAddress.phone,
          addressLine:
            defaultAddress.addressLine,
          city: defaultAddress.city,
          state: defaultAddress.state,
          postalCode:
            defaultAddress.postalCode,
        }));

        setShowManualAddressForm(false);
      }
    } catch (error) {
      console.error(
        "Failed to load saved addresses:",
        error
      );

      setAddressLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load saved addresses."
      );
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [token]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  /*
   * Select a saved address.
   */
  const handleSelectAddress = (
    address: Address
  ) => {
    setSelectedAddressId(address._id);
    setSaveAddress(false);
    setFormData((previousData) => ({
      ...previousData,
      fullName: address.fullName,
      phone: address.phone,
      addressLine: address.addressLine,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
    }));

    setShowManualAddressForm(false);

    setErrors((previousErrors) => ({
      ...previousErrors,
      fullName: undefined,
      phone: undefined,
      addressLine: undefined,
      city: undefined,
      state: undefined,
      postalCode: undefined,
      submit: undefined,
    }));
  };

  /*
   * Start entering a new/manual address.
   */
  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setSaveAddress(false);
    setNewAddressLabel("HOME");

    setFormData((previousData) => ({
      ...previousData,
      fullName: user?.name ?? "",
      phone: "",
      addressLine: "",
      city: "",
      state: "",
      postalCode: "",
    }));

    setShowManualAddressForm(true);

    setErrors((previousErrors) => ({
      ...previousErrors,
      fullName: undefined,
      phone: undefined,
      addressLine: undefined,
      city: undefined,
      state: undefined,
      postalCode: undefined,
      submit: undefined,
    }));
  };

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    const { name, value } =
      event.target;

    /*
     * If the user manually edits any address
     * field, the selected saved address is no
     * longer considered selected.
     */
    if (
      [
        "fullName",
        "phone",
        "addressLine",
        "city",
        "state",
        "postalCode",
      ].includes(name)
    ) {
      setSelectedAddressId(null);
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: undefined,
      submit: undefined,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const fullName =
      formData.fullName.trim();

    const email =
      formData.email.trim().toLowerCase();

    const phone =
      formData.phone.trim();

    const addressLine =
      formData.addressLine.trim();

    const city =
      formData.city.trim();

    const state =
      formData.state.trim();

    const postalCode =
      formData.postalCode.trim();

    if (!fullName) {
      newErrors.fullName =
        "Full name is required";
    } else if (
      fullName.length < 2 ||
      fullName.length > 50
    ) {
      newErrors.fullName =
        "Full name must be between 2 and 50 characters";
    }

    if (!email) {
      newErrors.email =
        "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      newErrors.email =
        "Enter a valid email address";
    }

    if (!phone) {
      newErrors.phone =
        "Phone number is required";
    } else if (
      !/^[6-9]\d{9}$/.test(phone)
    ) {
      newErrors.phone =
        "Enter a valid 10-digit Indian mobile number";
    }

    if (!addressLine) {
      newErrors.addressLine =
        "Address is required";
    } else if (
      addressLine.length < 5 ||
      addressLine.length > 200
    ) {
      newErrors.addressLine =
        "Address must be between 5 and 200 characters";
    }

    if (!city) {
      newErrors.city =
        "City is required";
    } else if (
      city.length < 2 ||
      city.length > 50
    ) {
      newErrors.city =
        "Enter a valid city";
    }

    if (!state) {
      newErrors.state =
        "State is required";
    } else if (
      !INDIAN_STATES.includes(state)
    ) {
      newErrors.state =
        "Select a valid state";
    }

    if (!postalCode) {
      newErrors.postalCode =
        "Postal code is required";
    } else if (
      !/^\d{6}$/.test(postalCode)
    ) {
      newErrors.postalCode =
        "Enter a valid 6-digit postal code";
    }

    if (!formData.payment) {
      newErrors.payment =
        "Select a payment method";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const saveCheckoutAddress = async (): Promise<void> => {
    if (!token || selectedAddressId) {
      return;
    }

    await apiRequest("/users/addresses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        label: newAddressLabel,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine: formData.addressLine.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        isDefault: addresses.length === 0,
      }),
    });
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (cartItems.length === 0) {
      setErrors({
        submit: "Your cart is empty.",
      });

      return;
    }

    if (!token) {
      setErrors({
        submit:
          "Your session has expired. Please log in again.",
      });

      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      setErrors({
        submit: undefined,
      });

      const paymentMethod: PaymentMethod =
        formData.payment;

      /*
  * Save a manually entered address if the user
  * explicitly requested it.
  *
  * Address persistence is intentionally independent
  * from order creation. A failure to save the
  * convenience address must not prevent the order.
  */


      const response =
        await createOrder(token, {
          shippingAddress: {
            fullName:
              formData.fullName.trim(),
            phone:
              formData.phone.trim(),
            addressLine:
              formData.addressLine.trim(),
            city:
              formData.city.trim(),
            state:
              formData.state.trim(),
            postalCode:
              formData.postalCode.trim(),
          },
          paymentMethod,
        });

      if (
        !response.success ||
        !response.order?._id
      ) {
        throw new Error(
          response.message ||
          "Unable to place your order"
        );
      }

      /*
       * Backend has already:
       * - validated products
       * - validated stock
       * - calculated prices
       * - created the order
       * - cleared MongoDB cart
       *
       * Now synchronize Redux with the
       * successful server operation.
       */
      dispatch(clearCart());

      setOrderId(response.order._id);

      /*
       * The order is successfully created.
       * Saving the address is only a convenience feature
       * and must never affect order creation.
       */
      if (saveAddress && !selectedAddressId) {
        try {
          await saveCheckoutAddress();
        } catch (addressError) {
          console.error(
            "Order placed, but failed to save checkout address:",
            addressError
          );
        }
      }

      setIsOrderPlaced(true);

    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to place your order. Please try again.";

      setErrors({
        submit: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (
    cartItems.length === 0 &&
    !isOrderPlaced
  ) {
    return (
      <ProtectedRoute>
        <main className="checkout-page">
          <div className="checkout-empty">
            <h1>Your cart is empty</h1>

            <p>
              Add products to your cart
              before checkout.
            </p>

            <Link
              href="/products"
              className="continue-shopping-btn"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (isOrderPlaced) {
    return (
      <ProtectedRoute>
        <main className="checkout-page">
          <div
            className="order-success"
            role="status"
            aria-live="polite"
          >
            <div
              className="success-icon"
              aria-hidden="true"
            >
              ✓
            </div>

            <h1>
              Order Placed Successfully!
            </h1>

            <p>
              Thank you for shopping with
              ShopCart.
            </p>

            <p className="order-id">
              Order ID:{" "}
              <strong>{orderId}</strong>
            </p>

            <div className="checkout-success-actions">
              <Link
                href={`/orders/${orderId}`}
                className="continue-shopping-btn"
              >
                View Order
              </Link>

              <Link
                href="/orders"
                className="continue-shopping-btn"
              >
                View All Orders
              </Link>

              <Link
                href="/products"
                className="continue-shopping-btn"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main
        className="checkout-page"
        aria-labelledby="checkout-title"
      >
        <div className="checkout-container">
          <h1
            id="checkout-title"
            className="checkout-title"
          >
            Checkout
          </h1>

          <div className="checkout-layout">
            <section
              className="checkout-form-section"
              aria-labelledby="customer-information-title"
            >
              <h2 id="customer-information-title">
                Customer Information
              </h2>

              <form
                className="checkout-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="form-group">
                  <label htmlFor="fullName">
                    Full Name
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    maxLength={50}
                    aria-invalid={Boolean(
                      errors.fullName
                    )}
                    aria-describedby={
                      errors.fullName
                        ? "fullName-error"
                        : undefined
                    }
                  />

                  {errors.fullName && (
                    <p
                      id="fullName-error"
                      className="field-error"
                    >
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    maxLength={100}
                    aria-invalid={Boolean(
                      errors.email
                    )}
                    aria-describedby={
                      errors.email
                        ? "email-error"
                        : undefined
                    }
                  />

                  {errors.email && (
                    <p
                      id="email-error"
                      className="field-error"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                <h2>
                  Shipping Address
                </h2>

                {isLoadingAddresses && (
                  <div className="saved-address-loading">
                    Loading your saved addresses...
                  </div>
                )}

                {addressLoadError && (
                  <p
                    className="saved-address-error"
                    role="alert"
                  >
                    {addressLoadError}
                  </p>
                )}

                {!isLoadingAddresses &&
                  addresses.length > 0 && (
                    <>
                      <div
                        className="saved-addresses"
                        aria-label="Saved delivery addresses"
                      >
                        {addresses.map(
                          (address) => {
                            const AddressIcon =
                              getAddressIcon(
                                address.label
                              );

                            const isSelected =
                              selectedAddressId ===
                              address._id;

                            return (
                              <button
                                key={address._id}
                                type="button"
                                className={`saved-address-card ${isSelected
                                  ? "selected"
                                  : ""
                                  }`}
                                onClick={() =>
                                  handleSelectAddress(
                                    address
                                  )
                                }
                                aria-pressed={
                                  isSelected
                                }
                              >
                                <div className="saved-address-card-header">
                                  <span className="saved-address-label">
                                    <AddressIcon
                                      size={17}
                                      aria-hidden="true"
                                    />
                                    {
                                      address.label
                                    }
                                  </span>

                                  {address.isDefault && (
                                    <span className="saved-address-default">
                                      <Check
                                        size={12}
                                        aria-hidden="true"
                                      />
                                      Default
                                    </span>
                                  )}
                                </div>

                                <div className="saved-address-content">
                                  <strong>
                                    {
                                      address.fullName
                                    }
                                  </strong>

                                  <p>
                                    {
                                      address.phone
                                    }
                                  </p>

                                  <p>
                                    {
                                      address.addressLine
                                    }
                                  </p>

                                  <p>
                                    {address.city},{" "}
                                    {address.state}{" "}
                                    -{" "}
                                    {
                                      address.postalCode
                                    }
                                  </p>
                                </div>

                                {isSelected && (
                                  <div className="saved-address-selected">
                                    <Check
                                      size={15}
                                      aria-hidden="true"
                                    />
                                    Selected
                                  </div>
                                )}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        type="button"
                        className="saved-address-add-button"
                        onClick={
                          handleAddNewAddress
                        }
                      >
                        <Plus
                          size={16}
                          aria-hidden="true"
                        />
                        Use a New Address
                      </button>
                    </>
                  )}

                {addresses.length === 0 &&
                  !isLoadingAddresses && (
                    <button
                      type="button"
                      className="saved-address-add-button"
                      onClick={() =>
                        setShowManualAddressForm(
                          true
                        )
                      }
                    >
                      <Plus
                        size={16}
                        aria-hidden="true"
                      />
                      Add a New Address
                    </button>
                  )}

                {addresses.length > 0 &&
                  !showManualAddressForm && (

                    <button
                      type="button"
                      className="checkout-manual-address-toggle"
                      onClick={() =>
                        setShowManualAddressForm(
                          true
                        )
                      }
                    >
                      <MapPin
                        size={16}
                        aria-hidden="true"
                      />
                      Edit delivery address manually
                    </button>
                  )}

                {showManualAddressForm && (

                  <>
                    {addresses.length > 0 && (
                      <div className="saved-address-divider">
                        Or enter a new address
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="phone">
                        Phone Number
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter 10-digit mobile number"
                        maxLength={10}
                        inputMode="numeric"
                        autoComplete="tel"
                        aria-invalid={Boolean(
                          errors.phone
                        )}
                        aria-describedby={
                          errors.phone
                            ? "phone-error"
                            : undefined
                        }
                      />

                      {errors.phone && (
                        <p
                          id="phone-error"
                          className="field-error"
                        >
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="addressLine">
                        Address
                      </label>

                      <textarea
                        id="addressLine"
                        name="addressLine"
                        value={
                          formData.addressLine
                        }
                        onChange={handleChange}
                        placeholder="Enter your complete address"
                        rows={4}
                        maxLength={200}
                        autoComplete="street-address"
                        aria-invalid={Boolean(
                          errors.addressLine
                        )}
                        aria-describedby={
                          errors.addressLine
                            ? "addressLine-error"
                            : undefined
                        }
                      />

                      {errors.addressLine && (
                        <p
                          id="addressLine-error"
                          className="field-error"
                        >
                          {
                            errors.addressLine
                          }
                        </p>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="city">
                          City
                        </label>

                        <input
                          id="city"
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="City"
                          maxLength={50}
                          autoComplete="address-level2"
                          aria-invalid={Boolean(
                            errors.city
                          )}
                          aria-describedby={
                            errors.city
                              ? "city-error"
                              : undefined
                          }
                        />

                        {errors.city && (
                          <p
                            id="city-error"
                            className="field-error"
                          >
                            {errors.city}
                          </p>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="state">
                          State
                        </label>

                        <select
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          autoComplete="address-level1"
                          aria-invalid={Boolean(
                            errors.state
                          )}
                          aria-describedby={
                            errors.state
                              ? "state-error"
                              : undefined
                          }
                        >
                          <option value="">
                            Select state
                          </option>

                          {INDIAN_STATES.map(
                            (state) => (
                              <option
                                key={state}
                                value={state}
                              >
                                {state}
                              </option>
                            )
                          )}
                        </select>

                        {errors.state && (
                          <p
                            id="state-error"
                            className="field-error"
                          >
                            {errors.state}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="postalCode">
                        Postal Code
                      </label>

                      <input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        value={
                          formData.postalCode
                        }
                        onChange={handleChange}
                        placeholder="6-digit PIN code"
                        maxLength={6}
                        inputMode="numeric"
                        autoComplete="postal-code"
                        aria-invalid={Boolean(
                          errors.postalCode
                        )}
                        aria-describedby={
                          errors.postalCode
                            ? "postalCode-error"
                            : undefined
                        }
                      />

                      {errors.postalCode && (
                        <p
                          id="postalCode-error"
                          className="field-error"
                        >
                          {
                            errors.postalCode
                          }
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div className="checkout-save-address">
                  <label className="checkout-save-address-checkbox">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(event) =>
                        setSaveAddress(event.target.checked)
                      }
                    />

                    <span>
                      Save this address for future orders
                    </span>
                  </label>

                  {saveAddress && (
                    <div className="checkout-address-label">
                      <label htmlFor="checkout-address-label">
                        Address type
                      </label>

                      <select
                        id="checkout-address-label"
                        value={newAddressLabel}
                        onChange={(event) =>
                          setNewAddressLabel(
                            event.target.value as AddressLabel
                          )
                        }
                      >
                        <option value="HOME">Home</option>
                        <option value="WORK">Work</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  )}
                </div>

                <h2>Payment Method</h2>

                <div
                  className="payment-options"
                  role="radiogroup"
                  aria-label="Payment method"
                >
                  <label>
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={formData.payment === "COD"}
                      onChange={handleChange}
                    />

                    <span>Cash on Delivery</span>
                  </label>

                  <div className="payment-option-disabled" aria-disabled="true">
                    <span className="payment-option-disabled-radio" aria-hidden="true">
                      ○
                    </span>

                    <span>
                      <strong>Online Payment</strong>
                      <small>Coming soon</small>
                    </span>
                  </div>
                </div>

                {errors.payment && (
                  <p className="field-error" role="alert">
                    {errors.payment}
                  </p>
                )}

                {errors.submit && (
                  <p
                    className="field-error"
                    role="alert"
                    aria-live="assertive"
                  >
                    {errors.submit}
                  </p>
                )}

                <button
                  type="submit"
                  className="place-order-btn"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting
                    ? "Placing Order..."
                    : "Place Order"}
                </button>
              </form>
            </section>

            <aside
              className="checkout-summary"
              aria-labelledby="checkout-summary-title"
            >
              <h2 id="checkout-summary-title">
                Order Summary
              </h2>

              {cartItems.map((item) => (
                <div
                  className="checkout-summary-item"
                  key={item.product._id}
                >
                  <span>
                    {item.product.title} ×{" "}
                    {item.quantity}
                  </span>

                  <strong>
                    {formatCurrency(
                      item.product.price *
                      item.quantity
                    )}
                  </strong>
                </div>
              ))}

              <hr />

              <div className="summary-row">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>

              <div className="summary-row">
                <span>Subtotal</span>

                <span>
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <div className="summary-total">
                <span>Total</span>

                <strong>
                  {formatCurrency(subtotal)}
                </strong>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
