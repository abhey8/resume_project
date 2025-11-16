import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatPrice, getListingTypeLabel, getPropertyTypeLabel, getStatusLabel, getStatusColor } from '../utils/helpers';
import './Dashboard.css';

const Dashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/listings');
      setListings(response.data.listings);
    } catch (error) {
      console.error('Error loading listings:', error);
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      await api.delete(`/listings/${id}`);
      loadListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading">
            <p>Loading your listings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <div className="header-top">
            <div>
              <h1>My Listings</h1>
              <p>Manage your property listings</p>
            </div>
            <Link to="/listings/create" className="btn btn-primary">
              + Create New Listing
            </Link>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <h2>No listings yet</h2>
            <p>Start by creating your first property listing!</p>
            <Link to="/listings/create" className="btn btn-primary">
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ListingCard = ({ listing, onDelete }) => {
  const imageUrl =
    listing.images && listing.images.length > 0
      ? listing.images[0].url
      : null;

  return (
    <div className="dashboard-listing-card">
      <div className="listing-image-container">
        {imageUrl ? (
          <img src={imageUrl} alt={listing.title} className="listing-image" />
        ) : (
          <div className="no-image">🏠</div>
        )}
        <div
          className="status-badge"
          style={{ backgroundColor: getStatusColor(listing.status) }}
        >
          {getStatusLabel(listing.status)}
        </div>
      </div>
      <div className="listing-content">
        <h3 className="listing-title">{listing.title}</h3>
        <div className="listing-meta">
          <span className="listing-type">{getListingTypeLabel(listing.listingType)}</span>
          <span className="property-type">{getPropertyTypeLabel(listing.propertyType)}</span>
        </div>
        <div className="listing-location">
          📍 {listing.city}, {listing.state}
        </div>
        <div className="listing-price">{formatPrice(listing.price, listing.currency)}</div>
        <div className="listing-actions">
          <Link
            to={`/listings/${listing.id}`}
            className="btn btn-outline btn-sm"
          >
            View
          </Link>
          <Link
            to={`/listings/${listing.id}/edit`}
            className="btn btn-primary btn-sm"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(listing.id)}
            className="btn btn-danger btn-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

