const API_BASE_URL = window.location.origin;
// State
let allListings = [];
let currentFilters = {};
let locations = { cities: [], states: [] };

// DOM Elements
const listingsGrid = document.getElementById('listingsGrid');
const loadingIndicator = document.getElementById('loadingIndicator');
const noResults = document.getElementById('noResults');
const listingsCount = document.getElementById('listingsCount');
const searchInput = document.getElementById('searchInput');
const propertyTypeFilter = document.getElementById('propertyTypeFilter');
const cityFilter = document.getElementById('cityFilter');
const minPriceFilter = document.getElementById('minPriceFilter');
const maxPriceFilter = document.getElementById('maxPriceFilter');
const bedroomsFilter = document.getElementById('bedroomsFilter');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const listingModal = document.getElementById('listingModal');
const addListingModal = document.getElementById('addListingModal');
const addListingBtn = document.getElementById('addListingBtn');
const addListingForm = document.getElementById('addListingForm');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadLocations();
    loadListings();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    applyFiltersBtn.addEventListener('click', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    addListingBtn.addEventListener('click', () => openModal(addListingModal));
    addListingForm.addEventListener('submit', handleAddListing);
    
    // Modal close handlers
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            listingModal.style.display = 'none';
            addListingModal.style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === listingModal) listingModal.style.display = 'none';
        if (e.target === addListingModal) addListingModal.style.display = 'none';
    });

    // Cancel add listing
    document.getElementById('cancelAddBtn')?.addEventListener('click', () => {
        addListingModal.style.display = 'none';
        addListingForm.reset();
    });
}

// Load locations for filters
async function loadLocations() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/locations`);
        if (response.ok) {
            locations = await response.json();
            populateCityFilter();
        }
    } catch (error) {
        console.error('Error loading locations:', error);
    }
}

function populateCityFilter() {
    cityFilter.innerHTML = '<option value="">All Cities</option>';
    locations.cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityFilter.appendChild(option);
    });
}

// Load listings
async function loadListings(filters = {}) {
    try {
        showLoading(true);
        
        const queryParams = new URLSearchParams();
        if (filters.propertyType) queryParams.append('propertyType', filters.propertyType);
        if (filters.city) queryParams.append('city', filters.city);
        if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
        if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
        if (filters.bedrooms) queryParams.append('bedrooms', filters.bedrooms);
        queryParams.append('status', 'ACTIVE');
        queryParams.append('limit', '100');

        const response = await fetch(`${API_BASE_URL}/api/listings?${queryParams}`);
        if (response.ok) {
            const data = await response.json();
            allListings = data.listings;
            displayListings(allListings);
            updateListingsCount(data.total);
        } else {
            showError('Failed to load listings');
        }
    } catch (error) {
        console.error('Error loading listings:', error);
        showError('Failed to load listings. Please check your connection.');
    } finally {
        showLoading(false);
    }
}

// Display listings
function displayListings(listings) {
    if (listings.length === 0) {
        listingsGrid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';
    listingsGrid.innerHTML = listings.map(listing => createListingCard(listing)).join('');
    
    // Attach click handlers
    document.querySelectorAll('.listing-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const listingId = card.dataset.listingId;
            if (!e.target.closest('.btn')) {
                showListingDetails(parseInt(listingId));
            }
        });
    });
}

function createListingCard(listing) {
    const imageUrl = listing.images && listing.images.length > 0 
        ? listing.images[0].url 
        : null;
    
    const formattedPrice = formatPrice(listing.price, listing.currency);
    const propertyTypeLabel = listing.propertyType.replace('_', ' ');
    
    return `
        <div class="listing-card" data-listing-id="${listing.id}">
            <div class="listing-image-container">
                ${imageUrl 
                    ? `<img src="${imageUrl}" alt="${listing.title}" class="listing-image" onerror="this.parentElement.innerHTML='<div class=\\'no-image\\'>🏠</div>'">`
                    : `<div class="no-image">🏠</div>`
                }
            </div>
            <div class="listing-content">
                <h3 class="listing-title">${escapeHtml(listing.title)}</h3>
                <div class="listing-location">📍 ${escapeHtml(listing.city)}, ${escapeHtml(listing.state)}</div>
                <div class="listing-details">
                    ${listing.bedrooms ? `<div class="listing-detail">🛏️ ${listing.bedrooms} Bed</div>` : ''}
                    ${listing.bathrooms ? `<div class="listing-detail">🚿 ${listing.bathrooms} Bath</div>` : ''}
                    ${listing.areaSqFt ? `<div class="listing-detail">📐 ${formatArea(listing.areaSqFt)} sq ft</div>` : ''}
                </div>
                <div class="listing-price">${formattedPrice}</div>
                <span class="listing-type-badge">${propertyTypeLabel}</span>
            </div>
        </div>
    `;
}

// Show listing details
async function showListingDetails(listingId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/listings/${listingId}`);
        if (response.ok) {
            const listing = await response.json();
            displayListingDetails(listing);
            openModal(listingModal);
        } else {
            showError('Failed to load listing details');
        }
    } catch (error) {
        console.error('Error loading listing details:', error);
        showError('Failed to load listing details');
    }
}

function displayListingDetails(listing) {
    const formattedPrice = formatPrice(listing.price, listing.currency);
    const propertyTypeLabel = listing.propertyType.replace('_', ' ');
    
    let imagesHtml = '';
    if (listing.images && listing.images.length > 0) {
        imagesHtml = `
            <div class="detail-images">
                ${listing.images.map(img => 
                    `<img src="${img.url}" alt="${img.caption || listing.title}" class="detail-image" onerror="this.style.display='none'">`
                ).join('')}
            </div>
        `;
    }
    
    const specsHtml = `
        ${listing.bedrooms ? `
            <div class="spec-item">
                <div class="spec-label">Bedrooms</div>
                <div class="spec-value">${listing.bedrooms}</div>
            </div>
        ` : ''}
        ${listing.bathrooms ? `
            <div class="spec-item">
                <div class="spec-label">Bathrooms</div>
                <div class="spec-value">${listing.bathrooms}</div>
            </div>
        ` : ''}
        ${listing.areaSqFt ? `
            <div class="spec-item">
                <div class="spec-label">Area</div>
                <div class="spec-value">${formatArea(listing.areaSqFt)}</div>
            </div>
        ` : ''}
        <div class="spec-item">
            <div class="spec-label">Type</div>
            <div class="spec-value">${propertyTypeLabel}</div>
        </div>
    `;
    
    const amenitiesHtml = listing.amenities && listing.amenities.length > 0
        ? `
            <div class="detail-amenities">
                <h4>Amenities</h4>
                <div class="amenities-grid">
                    ${listing.amenities.map(amenity => 
                        `<span class="amenity-badge">${escapeHtml(amenity)}</span>`
                    ).join('')}
                </div>
            </div>
        `
        : '';
    
    const contactHtml = listing.owner ? `
        <div class="detail-contact">
            <h4>Contact Owner</h4>
            <div class="contact-info">
                <div class="contact-item">👤 <strong>${escapeHtml(listing.owner.name)}</strong></div>
                ${listing.owner.email ? `<div class="contact-item">📧 <a href="mailto:${listing.owner.email}">${listing.owner.email}</a></div>` : ''}
                ${listing.owner.phone ? `<div class="contact-item">📞 <a href="tel:${listing.owner.phone}">${listing.owner.phone}</a></div>` : ''}
            </div>
        </div>
    ` : '';

    document.getElementById('listingDetails').innerHTML = `
        <div class="listing-detail-view">
            ${imagesHtml}
            <div class="detail-info">
                <h2>${escapeHtml(listing.title)}</h2>
                <div class="listing-location">📍 ${escapeHtml(listing.address)}, ${escapeHtml(listing.city)}, ${escapeHtml(listing.state)}</div>
                <div class="detail-price">${formattedPrice}</div>
                <div class="detail-specs">${specsHtml}</div>
                ${listing.description ? `
                    <div class="detail-description">
                        <h4>Description</h4>
                        <p>${escapeHtml(listing.description).replace(/\n/g, '<br>')}</p>
                    </div>
                ` : ''}
                ${amenitiesHtml}
                ${contactHtml}
            </div>
        </div>
    `;
}

// Filters
function applyFilters() {
    currentFilters = {
        propertyType: propertyTypeFilter.value,
        city: cityFilter.value,
        minPrice: minPriceFilter.value,
        maxPrice: maxPriceFilter.value,
        bedrooms: bedroomsFilter.value
    };
    
    loadListings(currentFilters);
}

function clearFilters() {
    propertyTypeFilter.value = '';
    cityFilter.value = '';
    minPriceFilter.value = '';
    maxPriceFilter.value = '';
    bedroomsFilter.value = '';
    searchInput.value = '';
    currentFilters = {};
    loadListings();
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) {
        displayListings(allListings);
        return;
    }
    
    const filtered = allListings.filter(listing => 
        listing.title.toLowerCase().includes(searchTerm) ||
        listing.city.toLowerCase().includes(searchTerm) ||
        listing.address.toLowerCase().includes(searchTerm) ||
        (listing.description && listing.description.toLowerCase().includes(searchTerm))
    );
    
    displayListings(filtered);
    updateListingsCount(filtered.length);
}

// Add Listing
async function handleAddListing(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('listingTitle').value,
        description: document.getElementById('listingDescription').value,
        price: document.getElementById('listingPrice').value,
        propertyType: document.getElementById('listingPropertyType').value,
        bedrooms: document.getElementById('listingBedrooms').value,
        bathrooms: document.getElementById('listingBathrooms').value,
        areaSqFt: document.getElementById('listingArea').value,
        address: document.getElementById('listingAddress').value,
        city: document.getElementById('listingCity').value,
        state: document.getElementById('listingState').value,
        ownerId: document.getElementById('listingOwnerId').value,
        images: document.getElementById('listingImages').value
            .split('\n')
            .filter(url => url.trim())
            .map(url => ({ url: url.trim() }))
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/listings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            addListingModal.style.display = 'none';
            addListingForm.reset();
            loadListings(currentFilters);
            showSuccess('Listing created successfully!');
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to create listing');
        }
    } catch (error) {
        console.error('Error creating listing:', error);
        showError('Failed to create listing');
    }
}

// Utility Functions
function formatPrice(price, currency = 'INR') {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    });
    return formatter.format(numPrice);
}

function formatArea(area) {
    return new Intl.NumberFormat('en-IN').format(area);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading(show) {
    loadingIndicator.style.display = show ? 'block' : 'none';
}

function updateListingsCount(count) {
    listingsCount.textContent = `${count} ${count === 1 ? 'listing' : 'listings'} found`;
}

function openModal(modal) {
    modal.style.display = 'block';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showError(message) {
    alert(`Error: ${message}`);
}

function showSuccess(message) {
    alert(`Success: ${message}`);
}
