import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './CreateListing.css';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/listings/${id}`);
      const listing = response.data;

      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        price: listing.price?.toString() || '',
        listingType: listing.listingType || 'SELL',
        propertyType: listing.propertyType || '',
        bedrooms: listing.bedrooms?.toString() || '',
        bathrooms: listing.bathrooms?.toString() || '',
        areaSqFt: listing.areaSqFt?.toString() || '',
        address: listing.address || '',
        city: listing.city || '',
        state: listing.state || '',
        area: listing.area || '',
        country: listing.country || 'India',
        zipCode: listing.zipCode || '',
        status: listing.status || 'ACTIVE',
        amenities: Array.isArray(listing.amenities)
          ? listing.amenities.join(', ')
          : '',
        images: listing.images && listing.images.length > 0
          ? listing.images.map((img) => img.url).join('\n')
          : '',
      });
    } catch (error) {
      console.error('Error loading listing:', error);
      setError('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        areaSqFt: formData.areaSqFt ? parseFloat(formData.areaSqFt) : null,
        amenities: formData.amenities
          ? formData.amenities.split(',').map((a) => a.trim()).filter((a) => a)
          : [],
      };

      await api.put(`/listings/${id}`, payload);
      navigate(`/listings/${id}`);
    } catch (error) {
      console.error('Error updating listing:', error);
      setError(error.response?.data?.error || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading">
            <p>Loading listing...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="error">
            <p>Listing not found</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1>Edit Listing</h1>
          <p>Update your property listing</p>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="form-container create-listing-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="title">Title <span className="required">*</span></label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="textarea"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="listingType">Listing Type <span className="required">*</span></label>
                <select
                  id="listingType"
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                  <option value="RENT">Rent</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="propertyType">Property Type <span className="required">*</span></label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select Property Type</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="CONDOMINIUM">Condominium</option>
                  <option value="TOWNHOUSE">Townhouse</option>
                  <option value="LAND">Land</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="OFFICE">Office</option>
                  <option value="RETAIL">Retail</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="INDUSTRIAL">Industrial</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SOLD">Sold</option>
                  <option value="RENTED">Rented</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (₹) <span className="required">*</span></label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="input"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Property Details</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bedrooms">Bedrooms</label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  min="0"
                  className="input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bathrooms">Bathrooms</label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  min="0"
                  className="input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="areaSqFt">Area (sq ft)</label>
                <input
                  type="number"
                  id="areaSqFt"
                  name="areaSqFt"
                  value={formData.areaSqFt}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Location</h2>

            <div className="form-group">
              <label htmlFor="address">Address <span className="required">*</span></label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City <span className="required">*</span></label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State <span className="required">*</span></label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="zipCode">Zip Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Additional Information</h2>

            <div className="form-group">
              <label htmlFor="amenities">Amenities (comma-separated)</label>
              <input
                type="text"
                id="amenities"
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Parking, Gym, Swimming Pool"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/listings/${id}`)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListing;

