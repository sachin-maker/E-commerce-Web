"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    Check,
    ChevronLeft,
    Edit2,
    Home,
    MapPin,
    Plus,
    Trash2,
    Briefcase,
} from "lucide-react";

import { useAppSelector } from "@/app/store/hooks";
import { apiRequest } from "@/lib/api";

import "./addresses.css";

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

interface AddressResponse {
    success: boolean;
    message: string;
    address: Address;
}

interface AddressFormData {
    label: AddressLabel;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    isDefault: boolean;
}

const EMPTY_FORM: AddressFormData = {
    label: "HOME",
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    isDefault: false,
};

const getLabelIcon = (label: AddressLabel) => {
    if (label === "WORK") {
        return Briefcase;
    }

    return Home;
};

export default function AddressesClient() {
    const token = useAppSelector((state) => state.auth.token);

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(
        null
    );

    const [formData, setFormData] = useState<AddressFormData>(EMPTY_FORM);

    const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadAddresses = useCallback(async () => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            const response = await apiRequest<AddressesResponse>(
                "/users/addresses",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setAddresses(response.addresses || []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load your addresses."
            );
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadAddresses();
    }, [loadAddresses]);

    const resetForm = () => {
        setFormData(EMPTY_FORM);
        setEditingAddressId(null);
        setIsFormOpen(false);
    };

    const openAddForm = () => {
        setSuccessMessage("");
        setError("");
        setEditingAddressId(null);
        setFormData({
            ...EMPTY_FORM,
            isDefault: addresses.length === 0,
        });
        setIsFormOpen(true);
    };

    const openEditForm = (address: Address) => {
        setSuccessMessage("");
        setError("");
        setEditingAddressId(address._id);

        setFormData({
            label: address.label,
            fullName: address.fullName,
            phone: address.phone,
            addressLine: address.addressLine,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            isDefault: address.isDefault,
        });

        setIsFormOpen(true);
    };

    const handleInputChange = (
        field: keyof AddressFormData,
        value: string | boolean
    ) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!token) {
            setError("Please sign in to manage your addresses.");
            return;
        }

        try {
            setIsSaving(true);
            setError("");
            setSuccessMessage("");

            const isEditing = Boolean(editingAddressId);

            const endpoint = isEditing
                ? `/users/addresses/${editingAddressId}`
                : "/users/addresses";

            const method = isEditing ? "PATCH" : "POST";

            const response = await apiRequest<AddressResponse>(endpoint, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (isEditing) {
                setAddresses((current) =>
                    current.map((address) =>
                        address._id === response.address._id
                            ? response.address
                            : response.address.isDefault
                                ? { ...address, isDefault: false }
                                : address
                    )
                );

                setSuccessMessage("Address updated successfully.");
            } else {
                setAddresses((current) => {
                    const newAddress = response.address;

                    if (newAddress.isDefault) {
                        return [
                            ...current.map((address) => ({
                                ...address,
                                isDefault: false,
                            })),
                            newAddress,
                        ];
                    }

                    return [...current, newAddress];
                });

                setSuccessMessage("Address added successfully.");
            }

            resetForm();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save the address."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleSetDefault = async (addressId: string) => {
        if (!token) {
            setError("Please sign in to manage your addresses.");
            return;
        }

        try {
            setError("");
            setSuccessMessage("");

            const response = await apiRequest<AddressResponse>(
                `/users/addresses/${addressId}/default`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setAddresses((current) =>
                current.map((address) => ({
                    ...address,
                    isDefault: address._id === response.address._id,
                }))
            );

            setSuccessMessage("Default address updated.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update the default address."
            );
        }
    };

    const handleDelete = async () => {
        if (!token || !deleteAddressId) {
            return;
        }

        try {
            setIsDeleting(true);
            setError("");
            setSuccessMessage("");

            await apiRequest<{ success: boolean; message: string }>(
                `/users/addresses/${deleteAddressId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            await loadAddresses();

            setSuccessMessage("Address deleted successfully.");
            setDeleteAddressId(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete the address."
            );
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <main className="addresses-page">
                <div className="addresses-container">
                    <div className="addresses-loading">
                        <div className="addresses-spinner" />
                        <p>Loading your addresses...</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="addresses-page">
            <div className="addresses-container">
                <Link href="/account" className="addresses-back-link">
                    <ChevronLeft size={18} aria-hidden="true" />
                    Back to Account
                </Link>

                <header className="addresses-header">
                    <div>
                        <h1>Your Addresses</h1>
                        <p>Manage your saved delivery addresses.</p>
                    </div>

                    {!isFormOpen && (
                        <button
                            type="button"
                            className="addresses-add-button"
                            onClick={openAddForm}
                        >
                            <Plus size={18} aria-hidden="true" />
                            Add Address
                        </button>
                    )}
                </header>

                {error && (
                    <div className="addresses-alert addresses-alert-error" role="alert">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div
                        className="addresses-alert addresses-alert-success"
                        role="status"
                    >
                        <Check size={18} aria-hidden="true" />
                        {successMessage}
                    </div>
                )}

                {isFormOpen && (
                    <section className="address-form-card">
                        <div className="address-form-header">
                            <div>
                                <h2>
                                    {editingAddressId ? "Edit Address" : "Add New Address"}
                                </h2>
                                <p>
                                    {editingAddressId
                                        ? "Update your delivery details."
                                        : "Enter your delivery address details."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="address-form-close"
                                onClick={resetForm}
                                aria-label="Close address form"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="address-form">
                            <div className="address-form-grid">
                                <div className="address-field">
                                    <label htmlFor="address-label">Address type</label>
                                    <select
                                        id="address-label"
                                        value={formData.label}
                                        onChange={(event) =>
                                            handleInputChange(
                                                "label",
                                                event.target.value as AddressLabel
                                            )
                                        }
                                    >
                                        <option value="HOME">Home</option>
                                        <option value="WORK">Work</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                <div className="address-field">
                                    <label htmlFor="address-full-name">Full name</label>
                                    <input
                                        id="address-full-name"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(event) =>
                                            handleInputChange("fullName", event.target.value)
                                        }
                                        placeholder="Enter full name"
                                        autoComplete="name"
                                        required
                                        minLength={2}
                                        maxLength={100}
                                    />
                                </div>

                                <div className="address-field">
                                    <label htmlFor="address-phone">Phone number</label>
                                    <input
                                        id="address-phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(event) =>
                                            handleInputChange(
                                                "phone",
                                                event.target.value.replace(/\D/g, "").slice(0, 10)
                                            )
                                        }
                                        placeholder="10-digit mobile number"
                                        autoComplete="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        required
                                    />
                                </div>

                                <div className="address-field address-field-full">
                                    <label htmlFor="address-line">Address</label>
                                    <input
                                        id="address-line"
                                        type="text"
                                        value={formData.addressLine}
                                        onChange={(event) =>
                                            handleInputChange("addressLine", event.target.value)
                                        }
                                        placeholder="House no., building, street, area"
                                        autoComplete="street-address"
                                        maxLength={200}
                                        required
                                    />
                                </div>

                                <div className="address-field">
                                    <label htmlFor="address-city">City</label>
                                    <input
                                        id="address-city"
                                        type="text"
                                        value={formData.city}
                                        onChange={(event) =>
                                            handleInputChange("city", event.target.value)
                                        }
                                        placeholder="City"
                                        autoComplete="address-level2"
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div className="address-field">
                                    <label htmlFor="address-state">State</label>

                                    <select
                                        id="address-state"
                                        value={formData.state}
                                        onChange={(event) =>
                                            handleInputChange("state", event.target.value)
                                        }
                                        autoComplete="address-level1"
                                        required
                                    >
                                        <option value="">Select state</option>
                                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                        <option value="Assam">Assam</option>
                                        <option value="Bihar">Bihar</option>
                                        <option value="Chhattisgarh">Chhattisgarh</option>
                                        <option value="Goa">Goa</option>
                                        <option value="Gujarat">Gujarat</option>
                                        <option value="Haryana">Haryana</option>
                                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                                        <option value="Jharkhand">Jharkhand</option>
                                        <option value="Karnataka">Karnataka</option>
                                        <option value="Kerala">Kerala</option>
                                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                                        <option value="Maharashtra">Maharashtra</option>
                                        <option value="Manipur">Manipur</option>
                                        <option value="Meghalaya">Meghalaya</option>
                                        <option value="Mizoram">Mizoram</option>
                                        <option value="Nagaland">Nagaland</option>
                                        <option value="Odisha">Odisha</option>
                                        <option value="Punjab">Punjab</option>
                                        <option value="Rajasthan">Rajasthan</option>
                                        <option value="Sikkim">Sikkim</option>
                                        <option value="Tamil Nadu">Tamil Nadu</option>
                                        <option value="Telangana">Telangana</option>
                                        <option value="Tripura">Tripura</option>
                                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                                        <option value="Uttarakhand">Uttarakhand</option>
                                        <option value="West Bengal">West Bengal</option>
                                        <option value="Delhi">Delhi</option>
                                        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                        <option value="Ladakh">Ladakh</option>
                                        <option value="Puducherry">Puducherry</option>
                                        <option value="Chandigarh">Chandigarh</option>
                                        <option value="Andaman and Nicobar Islands">
                                            Andaman and Nicobar Islands
                                        </option>
                                        <option value="Dadra and Nagar Haveli and Daman and Diu">
                                            Dadra and Nagar Haveli and Daman and Diu
                                        </option>
                                        <option value="Lakshadweep">Lakshadweep</option>
                                    </select>
                                </div>

                                <div className="address-field">
                                    <label htmlFor="address-postal-code">Postal code</label>
                                    <input
                                        id="address-postal-code"
                                        type="text"
                                        value={formData.postalCode}
                                        onChange={(event) =>
                                            handleInputChange(
                                                "postalCode",
                                                event.target.value.replace(/\D/g, "").slice(0, 6)
                                            )
                                        }
                                        placeholder="6-digit PIN code"
                                        autoComplete="postal-code"
                                        inputMode="numeric"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            <label className="address-default-checkbox">
                                <input
                                    type="checkbox"
                                    checked={formData.isDefault}
                                    onChange={(event) =>
                                        handleInputChange("isDefault", event.target.checked)
                                    }
                                />
                                <span>Make this my default address</span>
                            </label>

                            <div className="address-form-actions">
                                <button
                                    type="button"
                                    className="address-secondary-button"
                                    onClick={resetForm}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="address-primary-button"
                                    disabled={isSaving}
                                >
                                    {isSaving
                                        ? "Saving..."
                                        : editingAddressId
                                            ? "Update Address"
                                            : "Save Address"}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                {!isFormOpen && addresses.length === 0 && (
                    <section className="addresses-empty">
                        <div className="addresses-empty-icon">
                            <MapPin size={32} aria-hidden="true" />
                        </div>

                        <h2>No saved addresses</h2>

                        <p>
                            Add an address to make checkout faster and easier.
                        </p>

                        <button
                            type="button"
                            className="addresses-add-button"
                            onClick={openAddForm}
                        >
                            <Plus size={18} aria-hidden="true" />
                            Add Your First Address
                        </button>
                    </section>
                )}

                {!isFormOpen && addresses.length > 0 && (
                    <section
                        className="addresses-grid"
                        aria-label="Saved addresses"
                    >
                        {addresses.map((address) => {
                            const LabelIcon = getLabelIcon(address.label);

                            return (
                                <article
                                    key={address._id}
                                    className={`address-card ${address.isDefault ? "address-card-default" : ""
                                        }`}
                                >
                                    <div className="address-card-header">
                                        <div className="address-label">
                                            <LabelIcon size={18} aria-hidden="true" />
                                            <span>{address.label}</span>
                                        </div>

                                        {address.isDefault && (
                                            <span className="address-default-badge">
                                                <Check size={14} aria-hidden="true" />
                                                Default
                                            </span>
                                        )}
                                    </div>

                                    <div className="address-card-body">
                                        <strong>{address.fullName}</strong>

                                        <p>{address.phone}</p>

                                        <p>{address.addressLine}</p>

                                        <p>
                                            {address.city}, {address.state} -{" "}
                                            {address.postalCode}
                                        </p>
                                    </div>

                                    <div className="address-card-actions">
                                        <button
                                            type="button"
                                            className="address-action-button"
                                            onClick={() => openEditForm(address)}
                                        >
                                            <Edit2 size={16} aria-hidden="true" />
                                            Edit
                                        </button>

                                        {!address.isDefault && (
                                            <button
                                                type="button"
                                                className="address-action-button"
                                                onClick={() => handleSetDefault(address._id)}
                                            >
                                                <Check size={16} aria-hidden="true" />
                                                Set Default
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className="address-action-button address-delete-button"
                                            onClick={() => setDeleteAddressId(address._id)}
                                        >
                                            <Trash2 size={16} aria-hidden="true" />
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}
            </div>

            {deleteAddressId && (
                <div
                    className="address-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setDeleteAddressId(null);
                        }
                    }}
                >
                    <div
                        className="address-delete-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-address-title"
                    >
                        <div className="address-delete-icon">
                            <Trash2 size={24} aria-hidden="true" />
                        </div>

                        <h2 id="delete-address-title">Delete address?</h2>

                        <p>
                            Are you sure you want to delete this saved address?
                        </p>

                        <div className="address-modal-actions">
                            <button
                                type="button"
                                className="address-secondary-button"
                                onClick={() => setDeleteAddressId(null)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="address-danger-button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete Address"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
