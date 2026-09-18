
import Link from "next/link";
import {
  ArrowRight,
  Gem,
  Smartphone,
  Sofa,
  ShoppingBasket,
  Shirt,
  Footprints,
  Sparkles,
  Laptop,
} from "lucide-react";

import "./CategoriesSection.css";

const categories = [
  {
    name: "Beauty",
    slug: "beauty",
    icon: Sparkles,
    color: "category-pink",
    description: "Beauty essentials",
  },
  {
    name: "Smartphones",
    slug: "smartphones",
    icon: Smartphone,
    color: "category-blue",
    description: "Latest devices",
  },
  {
    name: "Furniture",
    slug: "furniture",
    icon: Sofa,
    color: "category-orange",
    description: "Home furniture",
  },
  {
    name: "Groceries",
    slug: "groceries",
    icon: ShoppingBasket,
    color: "category-green",
    description: "Daily essentials",
  },
  {
    name: "Mens Shirts",
    slug: "mens-shirts",
    icon: Shirt,
    color: "category-purple",
    description: "Style for men",
  },
  {
    name: "Womens Shoes",
    slug: "womens-shoes",
    icon: Footprints,
    color: "category-yellow",
    description: "Step in style",
  },
  {
    name: "Laptops",
    slug: "laptops",
    icon: Laptop,
    color: "category-cyan",
    description: "Power & performance",
  },
  {
    name: "Jewellery",
    slug: "womens-jewellery",
    icon: Gem,
    color: "category-rose",
    description: "Elegant accessories",
  },
];

export default function CategoriesSection() {
  return (
    <section className="categories-section">
      <div className="home-container">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              Explore collections
            </span>

            <h2>Shop by Category</h2>

            <p>
              Find everything you need, organized
              just for you.
            </p>
          </div>

          <Link
            href="/products"
            className="section-view-all"
          >
            View All
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="categories-grid">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.slug}
                href={`/products/category/${category.slug}`}
                className="category-card"
              >
                <div
                  className={`category-icon ${category.color}`}
                >
                  <Icon size={27} strokeWidth={1.8} />
                </div>

                <h3>{category.name}</h3>

                <p>{category.description}</p>

                <span className="category-arrow">
                  <ArrowRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}