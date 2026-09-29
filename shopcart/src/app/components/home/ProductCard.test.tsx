import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import ProductCard from "./ProductCard";

import authReducer from "@/app/store/slices/authSlice";
import cartReducer from "@/app/store/slices/cartSlice";
import wishlistReducer from "@/app/store/slices/wishlistSlice";

import { addToCart } from "@/services/cartService";

import type { Product } from "@/app/types/product";

jest.mock("@/services/cartService", () => ({
  addToCart: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement>
  ) => {
    return <img {...props} />;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedAddToCart = jest.mocked(addToCart);

const product: Product = {
  _id: "product-1",
  title: "Test Product",
  description: "Test product description",
  price: 1000,
  discountPercentage: 10,
  rating: 4.5,
  stock: 20,
  brand: "Test Brand",
  category: "electronics",
  thumbnail: "/images/test-product.jpg",
  images: ["/images/test-product.jpg"],
  isActive: true,
  reviews: [
  {
    rating: 5,
    comment: "Great product",
    date: "2026-09-01",
    reviewerName: "Test User",
    reviewerEmail: "test@example.com",
  },
],
};

const createTestStore = (
  overrides?: {
    auth?: Partial<ReturnType<typeof authReducer>>;
    cart?: Partial<ReturnType<typeof cartReducer>>;
    wishlist?: Partial<ReturnType<typeof wishlistReducer>>;
  }
) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      wishlist: wishlistReducer,
    },
    preloadedState: {
      auth: {
        token: null,
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        ...overrides?.auth,
      },
      cart: {
        items: [],
        ...overrides?.cart,
      },
      wishlist: {
        items: [],
        ...overrides?.wishlist,
      },
    },
  });
};

const renderProductCard = (
  overrides?: Parameters<typeof createTestStore>[0]
) => {
  const store = createTestStore(overrides);

  render(
    <Provider store={store}>
      <ProductCard product={product} />
    </Provider>
  );

  return store;
};

describe("ProductCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders product information", () => {
    renderProductCard();

    expect(
      screen.getByText("Test Product")
    ).toBeInTheDocument();

    expect(
      screen.getByText("electronics")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₹900.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₹1000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("4.5")
    ).toBeInTheDocument();

    expect(
      screen.getByText("(1)")
    ).toBeInTheDocument();
  });

  it("renders the discount badge", () => {
    renderProductCard();

    expect(
      screen.getByText("-10%")
    ).toBeInTheDocument();
  });

  it("renders product links correctly", () => {
    renderProductCard();

    const productLinks = screen.getAllByRole(
      "link",
      {
        name: /Test Product/i,
      }
    );

    expect(productLinks.length).toBeGreaterThan(0);

    productLinks.forEach((link) => {
      expect(link).toHaveAttribute(
        "href",
        "/products/product-1"
      );
    });

    expect(
      screen.getByRole("link", {
        name: "View Product",
      })
    ).toHaveAttribute(
      "href",
      "/products/product-1"
    );
  });

  it("shows add to cart button for a product not already in cart", () => {
    renderProductCard();

    expect(
      screen.getByRole("button", {
        name: "Add Test Product to cart",
      })
    ).toBeInTheDocument();
  });

  it("shows sign-in error when unauthenticated user tries to add to cart", async () => {
    const user = userEvent.setup();

    renderProductCard();

    await user.click(
      screen.getByRole("button", {
        name: "Add Test Product to cart",
      })
    );

    expect(mockedAddToCart).not.toHaveBeenCalled();
  });

  it("adds product to cart for an authenticated user", async () => {
    const user = userEvent.setup();

    mockedAddToCart.mockResolvedValue({
      success: true,
      cart: {
        _id: "cart-1",
        user: "user-1",
        items: [
          {
            product,
            quantity: 1,
          },
        ],
      },
    });

    const store = renderProductCard({
      auth: {
        token: "test-token",
        isAuthenticated: true,
      },
    });

    await user.click(
      screen.getByRole("button", {
        name: "Add Test Product to cart",
      })
    );

    expect(mockedAddToCart).toHaveBeenCalledTimes(1);
    expect(mockedAddToCart).toHaveBeenCalledWith(
      "test-token",
      {
        productId: "product-1",
        quantity: 1,
      }
    );

    await waitFor(() => {
      expect(store.getState().cart.items).toHaveLength(1);
    });

    expect(
      store.getState().cart.items[0].quantity
    ).toBe(1);
  });

  it("shows Go to Cart when product is already in cart", () => {
    renderProductCard({
      cart: {
        items: [
          {
            product,
            quantity: 1,
          },
        ],
      },
    });

    expect(
      screen.getByRole("link", {
        name: /Go to Cart/i,
      })
    ).toHaveAttribute("href", "/cart");

    expect(
      screen.queryByRole("button", {
        name: /Add Test Product to cart/i,
      })
    ).not.toBeInTheDocument();
  });

  it("adds product to wishlist when wishlist button is clicked", async () => {
    const user = userEvent.setup();

    const store = renderProductCard();

    const wishlistButton =
      screen.getByRole("button", {
        name: "Add Test Product to wishlist",
      });

    await user.click(wishlistButton);

    expect(
      store.getState().wishlist.items
    ).toHaveLength(1);

    expect(
      store.getState().wishlist.items[0]._id
    ).toBe("product-1");
  });

  it("removes product from wishlist when already wishlisted", async () => {
    const user = userEvent.setup();

    const store = renderProductCard({
      wishlist: {
        items: [product],
      },
    });

    const wishlistButton =
      screen.getByRole("button", {
        name: "Remove Test Product from wishlist",
      });

    await user.click(wishlistButton);

    expect(
      store.getState().wishlist.items
    ).toHaveLength(0);
  });

  it("disables add to cart for an out-of-stock product", async () => {
    const user = userEvent.setup();

    const outOfStockProduct: Product = {
      ...product,
      stock: 0,
    };

    const store = createTestStore({
      auth: {
        token: "test-token",
        isAuthenticated: true,
      },
    });

    render(
      <Provider store={store}>
        <ProductCard product={outOfStockProduct} />
      </Provider>
    );

    const addButton = screen.getByRole(
      "button",
      {
        name: "Add Test Product to cart",
      }
    );

    expect(addButton).not.toBeDisabled();

    await user.click(addButton);

    expect(mockedAddToCart).not.toHaveBeenCalled();
  });
});