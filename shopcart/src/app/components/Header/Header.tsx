"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";

import SearchBox from "./SearchBox";
import AccountMenu from "./AccountMenu";

import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { logout } from "@/app/store/slices/authSlice";
import { clearStoredAccessToken } from "@/lib/authStorage";

import "./Header.css";

const categories = [
  { name: "Beauty", slug: "beauty" },
  { name: "Fragrances", slug: "fragrances" },
  { name: "Furniture", slug: "furniture" },
  { name: "Groceries", slug: "groceries" },
  { name: "Laptops", slug: "laptops" },
  { name: "Mens Shirts", slug: "mens-shirts" },
  { name: "Mens Shoes", slug: "mens-shoes" },
  {
    name: "Mobile Accessories",
    slug: "mobile-accessories",
  },
  { name: "Motorcycle", slug: "motorcycle" },
  { name: "Skin Care", slug: "skin-care" },
  { name: "Smartphones", slug: "smartphones" },
  {
    name: "Sports Accessories",
    slug: "sports-accessories",
  },
  { name: "Sunglasses", slug: "sunglasses" },
  { name: "Tablets", slug: "tablets" },
  { name: "Tops", slug: "tops" },
  { name: "Vehicle", slug: "vehicle" },
  { name: "Womens Bags", slug: "womens-bags" },
  { name: "Womens Dresses", slug: "womens-dresses" },
  {
    name: "Womens Jewellery",
    slug: "womens-jewellery",
  },
  { name: "Womens Shoes", slug: "womens-shoes" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const { user, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const cartItems = useAppSelector(
    (state) => state.cart.items
  );

  const wishlistItems = useAppSelector(
    (state) => state.wishlist.items
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const [
    isDesktopCategoryOpen,
    setIsDesktopCategoryOpen,
  ] = useState(false);

  const [
    isMobileCategoryOpen,
    setIsMobileCategoryOpen,
  ] = useState(false);

  const isAdmin = user?.role === "admin";

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const wishlistItemCount = wishlistItems.length;

  const isActive = (path: string) =>
    pathname === path;

  /*
   * Close menus whenever the route changes.
   * This also handles browser back/forward navigation.
   */
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDesktopCategoryOpen(false);
    setIsMobileCategoryOpen(false);
  }, [pathname]);

  /*
   * Close open menus with Escape.
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setIsMobileMenuOpen(false);
      setIsDesktopCategoryOpen(false);
      setIsMobileCategoryOpen(false);
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /*
   * Prevent background scrolling while the mobile
   * navigation menu is open.
   */
  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileCategoryOpen(false);
  };

  const closeDesktopCategory = () => {
    setIsDesktopCategoryOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    clearStoredAccessToken();

    setIsMobileMenuOpen(false);
    setIsMobileCategoryOpen(false);
    setIsDesktopCategoryOpen(false);

    router.push("/");
  };

  const getCategoryHref = (slug: string) =>
    `/categories/${encodeURIComponent(slug)}`;

  return (
    <header className="site-header">
      {/* Announcement bar */}
      <div className="announcement-bar">
        <div className="header-container announcement-content">
          <p>Free shipping on orders over ₹999</p>

          <div className="announcement-links">
            <Link href="/orders">
              Track Order
            </Link>

            <span
              className="announcement-divider"
              aria-hidden="true"
            >
              |
            </span>

            <Link href="/help">
              Help Center
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="header-main">
        <div className="header-container header-main-inner">
          {/* Logo */}
          <Link
            href="/"
            className="brand-logo"
            onClick={closeMobileMenu}
            aria-label="ShopCart home"
          >
            <span
              className="brand-logo-icon"
              aria-hidden="true"
            >
              S
            </span>

            <span className="brand-logo-text">
              Shop<span>Cart</span>
            </span>
          </Link>

          {/* Search */}
          <SearchBox />

          {/* Desktop actions */}
          <div className="header-actions">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="header-action"
              aria-label={`Wishlist, ${wishlistItemCount} items`}
            >
              <span className="header-action-icon">
                <Heart
                  size={23}
                  aria-hidden="true"
                />

                <span className="action-badge">
                  {wishlistItemCount}
                </span>
              </span>

              <span className="header-action-text">
                <small>My</small>
                <strong>Wishlist</strong>
              </span>
            </Link>

            {/* Orders */}
            <Link
              href="/orders"
              className="header-action"
              aria-label="Orders"
            >
              <Package
                size={20}
                aria-hidden="true"
              />

              <span className="header-action-text">
                <small>My</small>
                <strong>Orders</strong>
              </span>
            </Link>

            {/* Account */}
            {isAuthenticated && user ? (
              <AccountMenu
                user={user}
                isAdmin={isAdmin}
                onLogout={handleLogout}
              />
            ) : (
              <Link
                href="/login"
                className="header-action"
                aria-label="Login or account"
              >
                <UserRound
                  size={23}
                  aria-hidden="true"
                />

                <span className="header-action-text">
                  <small>Hello, Sign in</small>
                  <strong>Account</strong>
                </span>
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="header-action"
              aria-label={`Shopping cart, ${cartItemCount} items`}
            >
              <span className="header-action-icon">
                <ShoppingCart
                  size={24}
                  aria-hidden="true"
                />

                <span className="action-badge">
                  {cartItemCount}
                </span>
              </span>

              <span className="header-action-text">
                <small>My</small>
                <strong>Cart</strong>
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="mobile-menu-button"
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            onClick={() =>
              setIsMobileMenuOpen(
                (current) => !current
              )
            }
          >
            {isMobileMenuOpen ? (
              <X
                size={25}
                aria-hidden="true"
              />
            ) : (
              <Menu
                size={25}
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </div>

      {/* Desktop navigation */}
      <nav
        className="desktop-navbar"
        aria-label="Main navigation"
      >
        <div className="header-container navbar-inner">
          {/* Categories */}
          <div className="category-menu-wrapper">
            <button
              type="button"
              className="category-menu-button"
              aria-expanded={
                isDesktopCategoryOpen
              }
              aria-haspopup="true"
              aria-controls="desktop-category-menu"
              onClick={() =>
                setIsDesktopCategoryOpen(
                  (current) => !current
                )
              }
            >
              <Menu
                size={20}
                aria-hidden="true"
              />

              <span>All Categories</span>

              <ChevronDown
                size={17}
                aria-hidden="true"
                className={
                  isDesktopCategoryOpen
                    ? "chevron-rotate"
                    : ""
                }
              />
            </button>

            {isDesktopCategoryOpen && (
              <div
                id="desktop-category-menu"
                className="category-dropdown"
                role="region"
                aria-label="Product categories"
              >
                <div className="category-dropdown-title">
                  <h3>Shop by Category</h3>
                </div>

                <div className="category-grid">
                  {categories.map(
                    (category) => (
                      <Link
                        key={category.slug}
                        href={getCategoryHref(
                          category.slug
                        )}
                        onClick={
                          closeDesktopCategory
                        }
                      >
                        {category.name}
                      </Link>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main navigation */}
          <div className="main-nav-links">
            <Link
              href="/"
              className={
                isActive("/")
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Home
            </Link>

            <Link
              href="/products"
              className={
                isActive("/products")
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Shop
            </Link>

            <Link
              href="/products?sort=featured"
              className="nav-link"
            >
              Featured
            </Link>

            <Link
              href="/products?sort=deals"
              className="nav-link"
            >
              Deals
            </Link>

            <Link
              href="/products?sort=new"
              className="nav-link"
            >
              New Arrivals
            </Link>
          </div>

          <div className="navbar-right">
            <span className="navbar-delivery">
              <span
                className="delivery-dot"
                aria-hidden="true"
              />

              Fast Delivery
            </span>
          </div>
        </div>
      </nav>

      {/* Mobile navigation */}
      <div
        id="mobile-navigation-menu"
        className={
          isMobileMenuOpen
            ? "mobile-menu open"
            : "mobile-menu"
        }
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <h2>Menu</h2>

            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMobileMenu}
            >
              <X
                size={22}
                aria-hidden="true"
              />
            </button>
          </div>

          <nav
            className="mobile-nav-links"
            aria-label="Mobile navigation"
          >
            <Link
              href="/"
              onClick={closeMobileMenu}
            >
              Home
            </Link>

            <Link
              href="/products"
              onClick={closeMobileMenu}
            >
              Shop All Products
            </Link>

            <Link
              href="/products?sort=featured"
              onClick={closeMobileMenu}
            >
              Featured
            </Link>

            <Link
              href="/products?sort=deals"
              onClick={closeMobileMenu}
            >
              Deals
            </Link>

            <Link
              href="/products?sort=new"
              onClick={closeMobileMenu}
            >
              New Arrivals
            </Link>
          </nav>

          {/* Mobile categories */}
          <div className="mobile-menu-section">
            <button
              type="button"
              className="mobile-category-toggle"
              aria-expanded={
                isMobileCategoryOpen
              }
              aria-controls="mobile-category-list"
              onClick={() =>
                setIsMobileCategoryOpen(
                  (current) => !current
                )
              }
            >
              <span>Categories</span>

              <ChevronDown
                size={18}
                aria-hidden="true"
                className={
                  isMobileCategoryOpen
                    ? "chevron-rotate"
                    : ""
                }
              />
            </button>

            {isMobileCategoryOpen && (
              <div
                id="mobile-category-list"
                className="mobile-category-list"
              >
                {categories.map(
                  (category) => (
                    <Link
                      key={category.slug}
                      href={getCategoryHref(
                        category.slug
                      )}
                      onClick={closeMobileMenu}
                    >
                      {category.name}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

          {/* Mobile actions */}
          <div className="mobile-action-links">
            <Link
              href="/wishlist"
              onClick={closeMobileMenu}
              aria-label={`Wishlist, ${wishlistItemCount} items`}
            >
              <Heart
                size={20}
                aria-hidden="true"
              />

              <span>Wishlist</span>

              <span>
                {wishlistItemCount}
              </span>
            </Link>

            <Link
              href="/cart"
              onClick={closeMobileMenu}
              aria-label={`Cart, ${cartItemCount} items`}
            >
              <ShoppingCart
                size={20}
                aria-hidden="true"
              />

              <span>Cart</span>

              <span>{cartItemCount}</span>
            </Link>

            {isAuthenticated ? (
              <>
                <div className="mobile-user-info">
                  <UserRound
                    size={20}
                    aria-hidden="true"
                  />

                  <div>
                    <strong>
                      {user?.name || "User"}
                    </strong>

                    <small>
                      {user?.email || ""}
                    </small>
                  </div>
                </div>

                <Link
                  href="/account"
                  onClick={closeMobileMenu}
                >
                  <UserRound
                    size={20}
                    aria-hidden="true"
                  />

                  <span>My Account</span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={closeMobileMenu}
                  >
                    <ShieldCheck
                      size={20}
                      aria-hidden="true"
                    />

                    <span>
                      Admin Dashboard
                    </span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mobile-logout-button"
                  aria-label="Logout"
                >
                  <LogOut
                    size={20}
                    aria-hidden="true"
                  />

                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMobileMenu}
              >
                <UserRound
                  size={20}
                  aria-hidden="true"
                />

                <span>Login / Account</span>
              </Link>
            )}

            <Link
              href="/orders"
              onClick={closeMobileMenu}
            >
              <Package
                size={20}
                aria-hidden="true"
              />

              <span>Orders</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
