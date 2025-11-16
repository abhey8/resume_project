import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import { formatPrice, formatArea, getListingTypeLabel, getPropertyTypeLabel } from '../utils/helpers';
import './Compare.css';

const Compare = () => {
  const location = useLocation();
  const initialIds = location.state?.listingIds || [];
  const [selectedIds, setSelectedIds] = useState(initialIds);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allListings, setAllListings] = useState([]);

  useEffect(() => {
    loadAllListings();
    if (initialIds.length > 0) {
      compareListings(initialIds);
    }
  }, []);

  const loadAllListings = async () => {
    try {
      const response = await api.get('/listings?limit=100');
      setAllListings(response.data.listings);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };

  const compareListings = async (ids) => {
    if (ids.length < 2) {
      alert('Please select at least 2 properties to compare');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/listings/compare', { listingIds: ids });
      setListings(response.data.listings);
    } catch (error) {
      console.error('Error comparing listings:', error);
      alert('Failed to compare listings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddListing = (listingId) => {
    if (selectedIds.includes(listingId)) {
      setSelectedIds(selectedIds.filter(id => id !== listingId));
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, listingId]);
      } else {
        alert('You can compare up to 4 properties at once');
      }
    }
  };

  const handleCompare = () => {
    compareListings(selectedIds);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading">
            <p>Loading comparison...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1>Compare Properties</h1>
          <p>Select up to 4 properties to compare</p>
        </div>

        <div className="compare-selector">
          <div className="selector-header">
            <h3>Select Properties ({selectedIds.length}/4)</h3>
            <button
              onClick={handleCompare}
              disabled={selectedIds.length < 2}
              className="btn btn-primary"
            >
              Compare Selected
            </button>
          </div>

          <div className="listings-selector">
            {allListings.slice(0, 20).map((listing) => {
              const isSelected = selectedIds.includes(listing.id);
              return (
                <div
                  key={listing.id}
                  className={`selector-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAddListing(listing.id)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleAddListing(listing.id)}
                  />
                  <div className="selector-content">
                    <h4>{listing.title}</h4>
                    <p>{listing.city}, {listing.state}</p>
                    <p className="selector-price">{formatPrice(listing.price, listing.currency)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {listings.length > 0 && (
          <div className="comparison-table">
            <h2>Comparison Results</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Property</th>
                    {listings.map((listing) => (
                      <th key={listing.id}>
                        <Link to={`/listings/${listing.id}`}>
                          {listing.title}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Price</strong></td>
                    {listings.map((listing) => (
                      <td key={listing.id}>
                        {formatPrice(listing.price, listing.currency)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Type</strong></td>
                    {listings.map((listing) => (
                      <td key={listing.id}>
                        {getPropertyTypeLabel(listing.propertyType)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Listing Type</strong></td>
                    {listings.map((listing) => (
                      <td key={listing.id}>
                        {getListingTypeLabel(listing.listingType)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Location</strong></td>
                    {listings.map((listing) => (
                      <td key={listing.id}>
                        {listing.city}, {listing.state}
                      </td>
                    ))}
                  </tr>
                  {listings.some(l => l.bedrooms) && (
                    <tr>
                      <td><strong>Bedrooms</strong></td>
                      {listings.map((listing) => (
                        <td key={listing.id}>
                          {listing.bedrooms || 'N/A'}
                        </td>
                      ))}
                    </tr>
                  )}
                  {listings.some(l => l.bathrooms) && (
                    <tr>
                      <td><strong>Bathrooms</strong></td>
                      {listings.map((listing) => (
                        <td key={listing.id}>
                          {listing.bathrooms || 'N/A'}
                        </td>
                      ))}
                    </tr>
                  )}
                  {listings.some(l => l.areaSqFt) && (
                    <tr>
                      <td><strong>Area (sq ft)</strong></td>
                      {listings.map((listing) => (
                        <td key={listing.id}>
                          {listing.areaSqFt ? formatArea(listing.areaSqFt) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                  )}
                  <tr>
                    <td><strong>Status</strong></td>
                    {listings.map((listing) => (
                      <td key={listing.id}>
                        {listing.status}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;

