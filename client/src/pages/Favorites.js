import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatPrice, getListingTypeLabel, getPropertyTypeLabel } from '../utils/helpers';
import './Favorites.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/favorites');
      setFavorites(response.data.favorites.map((f) => f.listing));
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (listingId) => {
    try {
      await api.delete(`/favorites/${listingId}`);
      loadFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove favorite');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading">
            <p>Loading favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1>My Favorites</h1>
          <p>Properties you've saved</p>
        </div>

        {favorites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤍</div>
            <h2>No favorites yet</h2>
            <p>Start browsing properties and add them to your favorites!</p>
            <Link to="/" className="btn btn-primary">
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="listings-grid">
            {favorites.map((listing) => (
              <FavoriteCard
                key={listing.id}
                listing={listing}
                onRemove={() => handleRemoveFavorite(listing.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FavoriteCard = ({ listing, onRemove }) => {
  const imageUrl =
    listing.images && listing.images.length > 0
      ? listing.images[0].url
      : null;

  return (
    <div className="favorite-card">
      <Link to={`/listings/${listing.id}`} className="card-link">
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
        </div>
      </Link>
      <button onClick={onRemove} className="btn btn-danger btn-sm remove-btn">
        Remove
      </button>
    </div>
  );
};

export default Favorites;

