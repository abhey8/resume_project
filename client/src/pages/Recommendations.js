import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatPrice, getListingTypeLabel, getPropertyTypeLabel } from '../utils/helpers';
import './Recommendations.css';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/recommendations?limit=20');
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading">
            <p>Loading recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1>Recommended Properties</h1>
          <p>Based on your preferences and favorites</p>
        </div>

        {recommendations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💡</div>
            <h2>No recommendations yet</h2>
            <p>Start adding properties to your favorites to get personalized recommendations!</p>
            <Link to="/" className="btn btn-primary">
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="recommendations-grid">
            {recommendations.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ListingCard = ({ listing }) => {
  const imageUrl =
    listing.images && listing.images.length > 0
      ? listing.images[0].url
      : null;

  return (
    <Link to={`/listings/${listing.id}`} className="listing-card">
      <div className="listing-image-container">
        {imageUrl ? (
          <img src={imageUrl} alt={listing.title} className="listing-image" />
        ) : (
          <div className="no-image">🏠</div>
        )}
        <div className="listing-type-badge">
          {getListingTypeLabel(listing.listingType)}
        </div>
      </div>
      <div className="listing-content">
        <h3 className="listing-title">{listing.title}</h3>
        <div className="listing-location">
          📍 {listing.city}, {listing.state}
        </div>
        <div className="listing-price">{formatPrice(listing.price, listing.currency)}</div>
        <div className="listing-property-type">
          {getPropertyTypeLabel(listing.propertyType)}
        </div>
      </div>
    </Link>
  );
};

export default Recommendations;

