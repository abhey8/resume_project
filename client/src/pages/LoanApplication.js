import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { formatPrice } from '../utils/helpers';
import './LoanApplication.css';

const LoanApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const listing = location.state?.listing;

  const [formData, setFormData] = useState({
    listingId: listing?.id || '',
    loanAmount: listing ? (listing.price * 0.8).toFixed(0) : '',
    tenure: '240',
    purpose: 'Home Purchase',
    employment: 'Salaried',
    annualIncome: '',
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    setLoading(true);

    try {
      await api.post('/loans/apply', formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error applying for loan:', error);
      setError(error.response?.data?.error || 'Failed to apply for loan');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h2>Loan Application Submitted!</h2>
            <p>Your loan application has been submitted successfully. We will review it and get back to you soon.</p>
            <p>Application ID will be sent to your email.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1>Apply for Home Loan</h1>
          <p>Fill in your details to apply for a property loan</p>
        </div>

        {listing && (
          <div className="listing-preview">
            <h3>Property Details</h3>
            <div className="preview-content">
              <p><strong>{listing.title}</strong></p>
              <p>📍 {listing.city}, {listing.state}</p>
              <p className="preview-price">{formatPrice(listing.price, listing.currency)}</p>
            </div>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="loan-form">
          <div className="form-section">
            <h2>Loan Details</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="loanAmount">Loan Amount (₹) <span className="required">*</span></label>
                <input
                  type="number"
                  id="loanAmount"
                  name="loanAmount"
                  value={formData.loanAmount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1000"
                  className="input"
                  placeholder="Loan amount"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tenure">Loan Tenure (Months) <span className="required">*</span></label>
                <select
                  id="tenure"
                  name="tenure"
                  value={formData.tenure}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="60">5 Years (60 months)</option>
                  <option value="120">10 Years (120 months)</option>
                  <option value="180">15 Years (180 months)</option>
                  <option value="240">20 Years (240 months)</option>
                  <option value="300">25 Years (300 months)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="purpose">Loan Purpose <span className="required">*</span></label>
                <select
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="Home Purchase">Home Purchase</option>
                  <option value="Home Construction">Home Construction</option>
                  <option value="Home Improvement">Home Improvement</option>
                  <option value="Property Investment">Property Investment</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="employment">Employment Type <span className="required">*</span></label>
                <select
                  id="employment"
                  name="employment"
                  value={formData.employment}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="Salaried">Salaried</option>
                  <option value="Self Employed">Self Employed</option>
                  <option value="Business">Business</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="annualIncome">Annual Income (₹) <span className="required">*</span></label>
              <input
                type="number"
                id="annualIncome"
                name="annualIncome"
                value={formData.annualIncome}
                onChange={handleChange}
                required
                min="0"
                step="10000"
                className="input"
                placeholder="Annual income"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Personal Information</h2>

            <div className="form-group">
              <label htmlFor="name">Full Name <span className="required">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email <span className="required">*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number <span className="required">*</span></label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address <span className="required">*</span></label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                className="textarea"
                placeholder="Enter your complete address"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanApplication;

