import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { getAllStates, getCitiesByState, getAreasByCity } from '../utils/locations';
import './CreateListing.css';

const CreateListing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    listingType: 'SELL',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    areaSqFt: '',
    address: '',
    city: '',
    state: '',
    area: '',
    country: 'India',
    zipCode: '',
    amenities: '',
    images: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);

  useEffect(() => {
    if (selectedState) {
      const cities = getCitiesByState(selectedState);
      setAvailableCities(cities);
      setFormData(prev => ({ ...prev, state: selectedState, city: '', area: '' }));
    }
  }, [selectedState]);

  useEffect(() => {
    if (formData && formData.city) {
      const areas = getAreasByCity(formData.city);
      setAvailableAreas(areas);
    }
  }, [formData?.city]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setFormData({ ...formData, state, city: '', area: '' });
    setAvailableCities(getCitiesByState(state));
    setAvailableAreas([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
        images: formData.images
          ? formData.images.split('\n').map((url) => url.trim()).filter((url) => url)
          : [],
      };

      const response = await api.post('/listings', payload);
      
      if (response.data && response.data.id) {
        navigate(`/listings/${response.data.id}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      const errorDetails = error.response?.data;
      
      // Handle validation errors
      if (error.response?.status === 400 && errorDetails?.errors) {
        const validationErrors = errorDetails.errors.map(err => err.msg).join(', ');
        setError(`Validation Error: ${validationErrors}`);
      } else {
        const errorMessage = errorDetails?.details || errorDetails?.error || error.message || 'Failed to create listing';
        setError(errorMessage);
      }
      
      console.error('Full error response:', errorDetails);
      console.error('Error status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1>Create New Listing</h1>
          <p>Add a new property listing</p>
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
                placeholder="e.g., Beautiful 3 BHK Apartment in Downtown"
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
                placeholder="Describe your property..."
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
                  <optgroup label="Residential">
                    <option value="APARTMENT">Apartment / Flat</option>
                    <option value="HOUSE">Independent House</option>
                    <option value="VILLA">Villa</option>
                    <option value="CONDOMINIUM">Condominium</option>
                    <option value="TOWNHOUSE">Townhouse</option>
                    <option value="LAND">Residential Plot / Land</option>
                    <option value="PENTHOUSE">Penthouse</option>
                    <option value="STUDIO">Studio Apartment</option>
                    <option value="FARMHOUSE">Farmhouse</option>
                  </optgroup>
                  <optgroup label="Commercial">
                    <option value="COMMERCIAL">Commercial Property</option>
                    <option value="OFFICE">Office Space</option>
                    <option value="RETAIL">Retail Shop / Showroom</option>
                    <option value="WAREHOUSE">Warehouse / Godown</option>
                    <option value="INDUSTRIAL">Industrial Property</option>
                    <option value="HOTEL">Hotel / Restaurant</option>
                    <option value="MALL">Shopping Mall</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option value="AGRICULTURAL">Agricultural Land</option>
                    <option value="PLOT">Plot / Site</option>
                    <option value="OTHER">Other</option>
                  </optgroup>
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
                placeholder="Enter price"
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
                  placeholder="Number of bedrooms"
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
                  placeholder="Number of bathrooms"
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
                  placeholder="Property area"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Location</h2>

            <div className="form-group">
              <label htmlFor="address">Address / Locality <span className="required">*</span></label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="input"
                placeholder="Street address or locality name"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="state">State <span className="required">*</span></label>
                <select
                  id="state"
                  value={selectedState}
                  onChange={handleStateChange}
                  required
                  className="input"
                >
                  <option value="">Select State</option>
                  {getAllStates().map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="city">City <span className="required">*</span></label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="input"
                  disabled={!selectedState}
                >
                  <option value="">Select City</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {availableAreas.length > 0 && (
                <div className="form-group">
                  <label htmlFor="area">Area / Locality</label>
                  <select
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Select Area</option>
                    {availableAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="zipCode">Zip Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="input"
                  placeholder="Zip code"
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
                placeholder="e.g., Parking, Gym, Swimming Pool, Security"
              />
            </div>

            <div className="form-group">
              <label htmlFor="images">Image URLs (one per line)</label>
              <textarea
                id="images"
                name="images"
                value={formData.images}
                onChange={handleChange}
                rows="4"
                className="textarea"
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;

