// ES Homes 2 - Booking API Integration

// API endpoints
const API_ENDPOINTS = {
    APARTMENTS: '/api/apartments/',
    CHECK_AVAILABILITY: '/api/check-availability/',
    CREATE_BOOKING: '/api/create-booking/'
};

// Fetch all apartments
async function getApartments() {
    try {
        const response = await fetch(API_ENDPOINTS.APARTMENTS);
        if (!response.ok) {
            throw new Error('Failed to fetch apartments');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching apartments:', error);
        return [];
    }
}

// Fetch apartment details by ID
async function getApartmentDetails(apartmentId) {
    try {
        const response = await fetch(`${API_ENDPOINTS.APARTMENTS}${apartmentId}/`);
        if (!response.ok) {
            throw new Error('Failed to fetch apartment details');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching apartment details:', error);
        return null;
    }
}

// Check apartment availability
async function checkAvailability(apartmentId, checkInDate, checkOutDate) {
    try {
        const url = new URL(window.location.origin + API_ENDPOINTS.CHECK_AVAILABILITY);
        url.searchParams.append('apartment_id', apartmentId);
        url.searchParams.append('check_in', checkInDate);
        url.searchParams.append('check_out', checkOutDate);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to check availability');
        }
        
        const data = await response.json();
        return data.available;
    } catch (error) {
        console.error('Error checking availability:', error);
        return false;
    }
}

// Create a new booking
async function createBooking(bookingData) {
    try {
        const response = await fetch(API_ENDPOINTS.CREATE_BOOKING, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to create booking');
        }
        
        return {
            success: true,
            bookingId: data.booking_id
        };
    } catch (error) {
        console.error('Error creating booking:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Initialize booking form
function initBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) return;
    
    bookingForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const apartmentId = document.getElementById('apartment-id').value;
        const guestName = document.getElementById('guest-name').value;
        const guestEmail = document.getElementById('guest-email').value;
        const checkInDate = document.getElementById('check-in-date').value;
        const checkOutDate = document.getElementById('check-out-date').value;
        
        // Validate form data
        if (!apartmentId || !guestName || !guestEmail || !checkInDate || !checkOutDate) {
            showMessage('Please fill in all required fields', 'error');
            return;
        }
        
        // Check availability first
        const isAvailable = await checkAvailability(apartmentId, checkInDate, checkOutDate);
        if (!isAvailable) {
            showMessage('Sorry, this apartment is not available for the selected dates', 'error');
            return;
        }
        
        // Create booking
        const bookingData = {
            apartment_id: apartmentId,
            guest_name: guestName,
            guest_email: guestEmail,
            check_in_date: checkInDate,
            check_out_date: checkOutDate
        };
        
        const result = await createBooking(bookingData);
        
        if (result.success) {
            showMessage('Booking created successfully!', 'success');
            bookingForm.reset();
        } else {
            showMessage(result.error || 'Failed to create booking', 'error');
        }
    });
}

// Display message to user
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('message-container');
    if (!messageContainer) {
        const container = document.createElement('div');
        container.id = 'message-container';
        document.body.appendChild(container);
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `alert alert-${type}`;
    messageElement.textContent = message;
    
    document.getElementById('message-container').appendChild(messageElement);
    
    // Auto-remove message after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initBookingForm();
});