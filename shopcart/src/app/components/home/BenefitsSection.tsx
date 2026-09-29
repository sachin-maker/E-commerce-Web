import {
  Headphones,
  LockKeyhole,
  ShieldCheck,
  Truck,
} from "lucide-react";

import "./BenefitsSection.css";

const benefits = [
  {
    title: "Free Shipping",
    description: "On orders over ₹999",
    icon: Truck,
  },
  {
    title: "Secure Payments",
    description: "100% secure checkout",
    icon: LockKeyhole,
  },
  {
    title: "Quality Products",
    description: "Shop with confidence",
    icon: ShieldCheck,
  },
  {
    title: "24/7 Support",
    description: "We're here to help",
    icon: Headphones,
  },
];

export default function BenefitsSection() {
  return (
    <section
      className="benefits-section"
      aria-labelledby="benefits-title"
    >
      <div className="home-container">
        <h2
          id="benefits-title"
          className="sr-only"
        >
          Shopping Benefits
        </h2>

        <div className="benefits-grid">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="benefit-item"
              >
                <div
                  className="benefit-icon"
                  aria-hidden="true"
                >
                  <Icon size={24} />
                </div>

                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
