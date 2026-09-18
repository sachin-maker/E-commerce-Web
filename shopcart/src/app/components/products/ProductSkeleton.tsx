export default function ProductSkeleton() {
  return (
    <div className="product-skeleton">
      <div className="skeleton skeleton-image" />

      <div className="skeleton-content">
        <div className="skeleton skeleton-category" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-title short" />
        <div className="skeleton skeleton-rating" />
        <div className="skeleton skeleton-price" />
        <div className="skeleton skeleton-button" />
      </div>
    </div>
  );
}