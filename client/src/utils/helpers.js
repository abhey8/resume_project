export const formatPrice = (price, currency = 'INR') => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  });
  return formatter.format(numPrice);
};

export const formatArea = (area) => {
  return new Intl.NumberFormat('en-IN').format(area);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const getListingTypeLabel = (type) => {
  const labels = {
    BUY: 'Buy',
    SELL: 'Sell',
    RENT: 'Rent',
  };
  return labels[type] || type;
};

export const getPropertyTypeLabel = (type) => {
  const labels = {
    APARTMENT: 'Apartment',
    HOUSE: 'House',
    VILLA: 'Villa',
    CONDOMINIUM: 'Condominium',
    TOWNHOUSE: 'Townhouse',
    LAND: 'Land',
    COMMERCIAL: 'Commercial',
    OFFICE: 'Office',
    RETAIL: 'Retail',
    WAREHOUSE: 'Warehouse',
    INDUSTRIAL: 'Industrial',
    PENTHOUSE: 'Penthouse',
    STUDIO: 'Studio',
    FARMHOUSE: 'Farmhouse',
    HOTEL: 'Hotel',
    MALL: 'Shopping Mall',
    AGRICULTURAL: 'Agricultural Land',
    PLOT: 'Plot',
    OTHER: 'Other',
  };
  return labels[type] || type;
};

export const getStatusLabel = (status) => {
  const labels = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    SOLD: 'Sold',
    RENTED: 'Rented',
    PENDING: 'Pending',
  };
  return labels[status] || status;
};

export const getStatusColor = (status) => {
  const colors = {
    ACTIVE: 'var(--success-color)',
    INACTIVE: 'var(--secondary-color)',
    SOLD: 'var(--success-color)',
    RENTED: 'var(--warning-color)',
    PENDING: 'var(--warning-color)',
  };
  return colors[status] || 'var(--text-secondary)';
};

