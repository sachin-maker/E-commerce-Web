"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { clearCart } from "@/app/store/slices/cartSlice";
import { addOrder } from "@/app/store/slices/ordersSlice";
import "./Checkout.css";

interface CheckoutFormData {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    payment: string;
}

interface FormErrors {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    payment?: string;
}

export default function CheckoutPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const cartItems = useAppSelector(
        (state) => state.cart.items
    );


    const subtotal = cartItems.reduce(
        (total, item) =>
            total + item.product.price * item.quantity,
        0
    );

    const [formData, setFormData] = useState<CheckoutFormData>({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        payment: "cod",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isOrderPlaced, setIsOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState("");

    const handleChange = (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));

        setErrors((previousErrors) => ({
            ...previousErrors,
            [name]: "",
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            newErrors.email = "Enter a valid email address";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
            newErrors.phone =
                "Enter a valid 10-digit Indian mobile number";
        }

        if (!formData.address.trim()) {
            newErrors.address = "Address is required";
        }

        if (!formData.city.trim()) {
            newErrors.city = "City is required";
        }

        if (!formData.postalCode.trim()) {
            newErrors.postalCode = "Postal code is required";
        } else if (!/^\d{6}$/.test(formData.postalCode)) {
            newErrors.postalCode =
                "Enter a valid 6-digit postal code";
        }

        if (!formData.payment) {
            newErrors.payment = "Select a payment method";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const isValid = validateForm();

        if (!isValid) {
            return;
        }

        const orderId = `SC-${Date.now()}`;

        const newOrder = {
            id: orderId,
            date: new Date().toISOString(),
            items: cartItems,
            total: subtotal,
            customer: {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                postalCode: formData.postalCode,
                payment: formData.payment,
            },
        };

        dispatch(addOrder(newOrder));

        dispatch(clearCart());

        setOrderId(orderId);
        setIsOrderPlaced(true);
    };

    if (cartItems.length === 0 && !isOrderPlaced) {
        return (
            <main className="checkout-page">
                <div className="checkout-empty">
                    <h1>Your cart is empty</h1>

                    <p>
                        Add products to your cart before checkout.
                    </p>

                    <Link
                        href="/products"
                        className="continue-shopping-btn"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </main>
        );
    }

    if (isOrderPlaced) {
        return (
            <main className="checkout-page">
                <div className="order-success">
                    <div className="success-icon">✓</div>

                    <h1>Order Placed Successfully!</h1>

                    <p>
                        Thank you for shopping with ShopCart.
                    </p>

                    <p className="order-id">
                        Order ID: <strong>{orderId}</strong>
                    </p>

                    <Link
                        href="/products"
                        className="continue-shopping-btn"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="checkout-page">
            <div className="checkout-container">
                <h1 className="checkout-title">
                    Checkout
                </h1>

                <div className="checkout-layout">
                    <section className="checkout-form-section">
                        <h2>Customer Information</h2>

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
                                />

                                {errors.fullName && (
                                    <p className="field-error">
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
                                />

                                {errors.email && (
                                    <p className="field-error">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

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
                                />

                                {errors.phone && (
                                    <p className="field-error">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            <h2>Shipping Address</h2>

                            <div className="form-group">
                                <label htmlFor="address">
                                    Address
                                </label>

                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter your complete address"
                                    rows={4}
                                />

                                {errors.address && (
                                    <p className="field-error">
                                        {errors.address}
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
                                    />

                                    {errors.city && (
                                        <p className="field-error">
                                            {errors.city}
                                        </p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="postalCode">
                                        Postal Code
                                    </label>

                                    <input
                                        id="postalCode"
                                        name="postalCode"
                                        type="text"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        placeholder="6-digit PIN code"
                                        maxLength={6}
                                    />

                                    {errors.postalCode && (
                                        <p className="field-error">
                                            {errors.postalCode}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <h2>Payment Method</h2>

                            <div className="payment-options">
                                <label>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={formData.payment === "cod"}
                                        onChange={handleChange}
                                    />

                                    Cash on Delivery
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="card"
                                        checked={formData.payment === "card"}
                                        onChange={handleChange}
                                    />

                                    Credit/Debit Card
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="upi"
                                        checked={formData.payment === "upi"}
                                        onChange={handleChange}
                                    />

                                    UPI
                                </label>
                            </div>

                            {errors.payment && (
                                <p className="field-error">
                                    {errors.payment}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="place-order-btn"
                            >
                                Place Order
                            </button>
                        </form>
                    </section>

                    <aside className="checkout-summary">
                        <h2>Order Summary</h2>

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
                                    $
                                    {(
                                        item.product.price *
                                        item.quantity
                                    ).toFixed(2)}
                                </strong>
                            </div>
                        ))}

                        <hr />

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>

                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>

                        <div className="summary-total">
                            <span>Total</span>
                            <strong>${subtotal.toFixed(2)}</strong>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}