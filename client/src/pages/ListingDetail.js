import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  formatPrice,
  formatArea,
  getListingTypeLabel,
  getPropertyTypeLabel,
  getStatusLabel,
} from '../utils/helpers';
import './ListingDetail.css';

const ListingDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    loadListing();
    if (isAuthenticated) {
      checkFavorite();
    }
  }, [id, isAuthenticated]);

  const loadListing = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/listings/${id}`);
      setListing(response.data);
    } catch (error) {
      console.error('Error loading listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await api.get('/favorites');
      const favorites = response.data.favorites;
      setIsFavorite(favorites.some((f) => f.listingId === parseInt(id)));
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await api.post(`/favorites/${id}`);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      alert('Failed to update favorite');
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading">
            <p>Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="error">
            <p>Property not found</p>
            <Link to="/" className="btn btn-primary">
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <Link to="/" className="back-link">
          ← Back to Listings
        </Link>

        <div className="listing-detail">
          <div className="listing-images">
            {listing.images && listing.images.length > 0 ? (
              <div className="image-gallery">
                {listing.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.caption || listing.title}
                    className="detail-image"
                  />
                ))}
              </div>
            ) : (
              <div className="no-image-large">🏠</div>
            )}
          </div>

          <div className="listing-info">
            <div className="listing-header">
              <div>
                <div className="listing-badges">
                  <span className="type-badge">
                    {getListingTypeLabel(listing.listingType)}
                  </span>
                  <span className="status-badge">{getStatusLabel(listing.status)}</span>
                </div>
                <h1>{listing.title}</h1>
                <div className="listing-location">
                  📍 {listing.address}, {listing.city}, {listing.state}
                </div>
              </div>
              <div className="listing-actions">
                <button
                  onClick={handleFavorite}
                  disabled={favoriteLoading}
                  className={`btn ${isFavorite ? 'btn-danger' : 'btn-outline'}`}
                >
                  {isFavorite ? '❤️ Remove Favorite' : '🤍 Add to Favorites'}
                </button>
                {isAuthenticated && (
                  <Link
                    to="/loans/apply"
                    state={{ listing }}
                    className="btn btn-success"
                  >
                    💰 Apply for Loan
                  </Link>
                )}
                <Link
                  to="/compare"
                  state={{ listingIds: [listing.id] }}
                  className="btn btn-outline"
                >
                  📊 Compare
                </Link>
              </div>
            </div>

            <div className="listing-price-large">
              {formatPrice(listing.price, listing.currency)}
            </div>

            <div className="listing-specs">
              {listing.bedrooms && (
                <div className="spec-item">
                  <div className="spec-label">Bedrooms</div>
                  <div className="spec-value">{listing.bedrooms}</div>
                </div>
              )}
              {listing.bathrooms && (
                <div className="spec-item">
                  <div className="spec-label">Bathrooms</div>
                  <div className="spec-value">{listing.bathrooms}</div>
                </div>
              )}
              {listing.areaSqFt && (
                <div className="spec-item">
                  <div className="spec-label">Area</div>
                  <div className="spec-value">{formatArea(listing.areaSqFt)} sq ft</div>
                </div>
              )}
              <div className="spec-item">
                <div className="spec-label">Property Type</div>
                <div className="spec-value">{getPropertyTypeLabel(listing.propertyType)}</div>
              </div>
            </div>

            {listing.description && (
              <div className="listing-description">
                <h3>Description</h3>
                <p>{listing.description}</p>
              </div>
            )}

            {listing.amenities && listing.amenities.length > 0 && (
              <div className="listing-amenities">
                <h3>Amenities</h3>
                <div className="amenities-grid">
                  {listing.amenities.map((amenity, index) => (
                    <span key={index} className="amenity-badge">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {listing.owner && (
              <div className="listing-contact">
                <h3>Contact Owner</h3>
                <div className="contact-info">
                  <div className="contact-item">
                    <strong>Name:</strong> {listing.owner.name}
                  </div>
                  {listing.owner.email && (
                    <div className="contact-item">
                      <strong>Email:</strong>{' '}
                      <a href={`mailto:${listing.owner.email}`}>
                        {listing.owner.email}
                      </a>
                    </div>
                  )}
                  {listing.owner.phone && (
                    <div className="contact-item">
                      <strong>Phone:</strong>{' '}
                      <a href={`tel:${listing.owner.phone}`}>
                        {listing.owner.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;

