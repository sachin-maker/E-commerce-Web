export default function ProductDetailsSkeleton() {
  return (
    <main className="product-details-page">
      <div className="container">
        <div className="product-details-layout">
          <div className="product-details-gallery-skeleton">
            <div className="skeleton skeleton-details-image" />

            <div className="details-thumbnail-skeleton-row">
              <div className="skeleton skeleton-details-thumbnail" />
              <div className="skeleton skeleton-details-thumbnail" />
              <div className="skeleton skeleton-details-thumbnail" />
            </div>
          </div>

          <div className="product-details-content-skeleton">
            <div className="skeleton skeleton-details-category" />
            <div className="skeleton skeleton-details-title" />
            <div className="skeleton skeleton-details-title short" />
            <div className="skeleton skeleton-details-rating" />
            <div className="skeleton skeleton-details-description" />
            <div className="skeleton skeleton-details-description" />
            <div className="skeleton skeleton-details-price" />
            <div className="skeleton skeleton-details-button" />
          </div>
        </div>
      </div>
    </main>
  );
}