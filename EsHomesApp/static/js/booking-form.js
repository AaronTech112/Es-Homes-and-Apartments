document.addEventListener('DOMContentLoaded', function() {
    const checkInInput = document.getElementById('check_in');
    const checkOutInput = document.getElementById('check_out');
    const guestsInput = document.getElementById('guests');
    const nightsCountElement = document.getElementById('nights-count');
    const totalAmountElement = document.getElementById('total-amount');
    const totalAmountInput = document.getElementById('total_amount_input');
    const bookingForm = document.getElementById('booking-form');

    // Set minimum dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = date => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Initialize date inputs
    if (!checkInInput.value) {
        checkInInput.value = formatDate(today);
    }
    if (!checkOutInput.value) {
        checkOutInput.value = formatDate(tomorrow);
    }

    checkInInput.min = formatDate(today);
    checkOutInput.min = formatDate(tomorrow);

    function calculateTotal() {
        const checkIn = new Date(checkInInput.value);
        const checkOut = new Date(checkOutInput.value);
        
        if (checkIn && checkOut && checkOut > checkIn) {
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            const pricePerNight = parseFloat(document.querySelector('[data-price-per-night]').dataset.pricePerNight);
            const total = nights * pricePerNight;
            
            nightsCountElement.textContent = nights;
            totalAmountElement.textContent = `₦${total.toLocaleString()}`;
            totalAmountInput.value = total;
        } else {
            nightsCountElement.textContent = '0';
            totalAmountElement.textContent = '₦0';
            totalAmountInput.value = '0';
        }
    }

    // Event listeners
    checkInInput.addEventListener('change', function() {
        const nextDay = new Date(this.value);
        nextDay.setDate(nextDay.getDate() + 1);
        checkOutInput.min = formatDate(nextDay);
        
        if (checkOutInput.value && new Date(checkOutInput.value) <= new Date(this.value)) {
            checkOutInput.value = formatDate(nextDay);
        }
        
        calculateTotal();
    });

    checkOutInput.addEventListener('change', calculateTotal);
    guestsInput.addEventListener('change', calculateTotal);

    // Form validation
    bookingForm.addEventListener('submit', function(event) {
        const checkIn = new Date(checkInInput.value);
        const checkOut = new Date(checkOutInput.value);
        const guests = parseInt(guestsInput.value);
        const maxGuests = parseInt(guestsInput.getAttribute('max'));

        let isValid = true;
        let errorMessage = '';

        if (checkIn >= checkOut) {
            isValid = false;
            errorMessage = 'Check-out date must be after check-in date.';
        } else if (guests < 1 || guests > maxGuests) {
            isValid = false;
            errorMessage = `Number of guests must be between 1 and ${maxGuests}.`;
        }

        if (!isValid) {
            event.preventDefault();
            alert(errorMessage);
        }
    });

    // Calculate initial total
    calculateTotal();
});