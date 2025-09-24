// ES Homes 2 - Booking Integration with Django Backend

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the booking form
    const bookingForm = document.getElementById('booking-form');
    const apartmentSelect = document.getElementById('apartment');
    const apartmentIdField = document.getElementById('apartment-id');
    
    // Load apartments from API
    loadApartments();
    
    // Set up event listeners
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    if (apartmentSelect) {
        apartmentSelect.addEventListener('change', function() {
            apartmentIdField.value = this.value;
            updateSummary();
        });
    }
    
    // Set minimum dates for check-in and check-out
    const today = new Date().toISOString().split('T')[0];
    const checkInDate = document.getElementById('check-in-date');
    const checkOutDate = document.getElementById('check-out-date');
    
    if (checkInDate) {
        checkInDate.min = today;
        checkInDate.addEventListener('change', function() {
            // Set check-out date minimum to day after check-in
            if (checkOutDate) {
                const nextDay = new Date(this.value);
                nextDay.setDate(nextDay.getDate() + 1);
                checkOutDate.min = nextDay.toISOString().split('T')[0];
                
                // If check-out date is before check-in date, reset it
                if (checkOutDate.value && new Date(checkOutDate.value) <= new Date(this.value)) {
                    checkOutDate.value = nextDay.toISOString().split('T')[0];
                }
            }
            
            checkAvailability();
        });
    }
    
    if (checkOutDate) {
        checkOutDate.addEventListener('change', checkAvailability);
    }
});

// Load apartments from API
async function loadApartments() {
    const apartmentSelect = document.getElementById('apartment');
    if (!apartmentSelect) return;
    
    try {
        const response = await fetch('/api/apartments/');
        if (!response.ok) {
            throw new Error('Failed to fetch apartments');
        }
        
        const apartments = await response.json();
        
        // Clear existing options except the first one
        while (apartmentSelect.options.length > 1) {
            apartmentSelect.remove(1);
        }
        
        // Add apartments to select
        apartments.forEach(apt => {
            const option = document.createElement('option');
            option.value = apt.id;
            option.textContent = `${apt.name} - $${apt.price_per_night}/night`;
            option.dataset.price = apt.price_per_night;
            option.dataset.image = apt.image || '';
            option.dataset.name = apt.name;
            apartmentSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading apartments:', error);
        // Fallback to static data if API fails
        const staticApartments = [
            { id: 1, name: '2 Bedroom Luxury Apartment', price: 150000, image: 'media/IMG-20250918-WA0005.jpg' },
            { id: 2, name: '3 Bedroom Premium Apartment', price: 250000, image: 'media/IMG-20250918-WA0006.jpg' },
            { id: 3, name: 'Deluxe Studio Apartment', price: 100000, image: 'media/IMG-20250918-WA0007.jpg' }
        ];
        
        staticApartments.forEach(apt => {
            const option = document.createElement('option');
            option.value = apt.id;
            option.textContent = `${apt.name} - ₦${apt.price.toLocaleString()}/day`;
            option.dataset.price = apt.price;
            option.dataset.image = apt.image;
            option.dataset.name = apt.name;
            apartmentSelect.appendChild(option);
        });
    }
}

// Check apartment availability
async function checkAvailability() {
    const apartmentId = document.getElementById('apartment-id').value;
    const checkInDate = document.getElementById('check-in-date').value;
    const checkOutDate = document.getElementById('check-out-date').value;
    const messageContainer = document.getElementById('availability-message');
    
    if (!apartmentId || !checkInDate || !checkOutDate || !messageContainer) return;
    
    try {
        const url = `/api/check-availability/?apartment_id=${apartmentId}&check_in=${checkInDate}&check_out=${checkOutDate}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to check availability');
        }
        
        const data = await response.json();
        
        if (data.available) {
            messageContainer.textContent = 'This apartment is available for the selected dates!';
            messageContainer.className = 'success-message';
        } else {
            messageContainer.textContent = 'Sorry, this apartment is not available for the selected dates.';
            messageContainer.className = 'error-message';
        }
        
        messageContainer.style.display = 'block';
    } catch (error) {
        console.error('Error checking availability:', error);
    }
}

// Handle booking form submission
async function handleBookingSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const apartmentId = document.getElementById('apartment-id').value;
    const checkInDate = document.getElementById('check-in-date').value;
    const checkOutDate = document.getElementById('check-out-date').value;
    const firstName = document.getElementById('first-name')?.value || '';
    const lastName = document.getElementById('last-name')?.value || '';
    const email = document.getElementById('email')?.value || '';
    
    // Validate required fields
    if (!apartmentId || !checkInDate || !checkOutDate || !firstName || !lastName || !email) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create booking data
    const bookingData = {
        apartment_id: apartmentId,
        guest_name: `${firstName} ${lastName}`,
        guest_email: email,
        check_in_date: checkInDate,
        check_out_date: checkOutDate
    };
    
    try {
        const response = await fetch('/api/create-booking/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert('Booking created successfully! Your booking ID is: ' + data.booking_id);
            // Reset form or redirect to confirmation page
            window.location.href = 'index.html';
        } else {
            alert('Error creating booking: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        alert('Failed to create booking. Please try again later.');
    }
}

// Update booking summary
function updateSummary() {
    const apartmentSelect = document.getElementById('apartment');
    const checkInDate = document.getElementById('check-in-date');
    const checkOutDate = document.getElementById('check-out-date');
    
    if (!apartmentSelect || !checkInDate || !checkOutDate) return;
    
    const selectedOption = apartmentSelect.options[apartmentSelect.selectedIndex];
    if (!selectedOption || selectedOption.value === '') return;
    
    const apartmentName = selectedOption.dataset.name;
    const apartmentPrice = parseFloat(selectedOption.dataset.price);
    const apartmentImage = selectedOption.dataset.image;
    
    // Update summary elements if they exist
    const summaryName = document.querySelector('.summary-details h4');
    const summaryImage = document.querySelector('.summary-image img');
    const summaryPrice = document.querySelector('.summary-price');
    
    if (summaryName) summaryName.textContent = apartmentName;
    if (summaryImage && apartmentImage) summaryImage.src = apartmentImage;
    if (summaryPrice) summaryPrice.textContent = `₦${apartmentPrice.toLocaleString()}/day`;
    
    // Calculate total if dates are selected
    if (checkInDate.value && checkOutDate.value) {
        const startDate = new Date(checkInDate.value);
        const endDate = new Date(checkOutDate.value);
        const nights = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        const totalElement = document.querySelector('.total-value');
        if (totalElement && nights > 0) {
            const total = apartmentPrice * nights;
            totalElement.textContent = `₦${total.toLocaleString()}`;
        }
    }
}