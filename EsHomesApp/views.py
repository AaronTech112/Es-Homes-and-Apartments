from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from .forms import RegisterForm, BookingForm
from django.contrib import messages
from .models import Apartment, Transaction, Booking
from datetime import date
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import requests
import uuid
import decimal
from django.conf import settings
from django.urls import reverse


def home(request):
    featured_apartments = Apartment.objects.filter(featured=True, status='available')[:3]
    context = {
        'featured_apartments': featured_apartments
    }
    return render(request, 'EsHomesApp/index.html', context)

def about(request):
    return render(request, 'EsHomesApp/about.html')

from django.core.paginator import Paginator

def apartments(request):
    # Get filter parameters from request
    bedroom_filter = request.GET.get('bedrooms', 'all')
    price_filter = request.GET.get('price', 'all')
    
    # Start with all available apartments
    apartments = Apartment.objects.filter(status='available')
    
    # Apply bedroom filter
    if bedroom_filter != 'all':
        apartments = apartments.filter(bedrooms=int(bedroom_filter))
    
    # Apply price filter
    if price_filter != 'all':
        if price_filter == 'low':
            apartments = apartments.filter(price_per_night__lte=100000)
        elif price_filter == 'medium':
            apartments = apartments.filter(price_per_night__gt=100000, price_per_night__lte=200000)
        elif price_filter == 'high':
            apartments = apartments.filter(price_per_night__gt=200000)
    
    # Get unique bedroom counts for filter options
    bedroom_choices = sorted(Apartment.objects.values_list('bedrooms', flat=True).distinct())
    
    # Set up pagination
    paginator = Paginator(apartments, 6)  # Show 6 apartments per page
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)
    
    context = {
        'apartments': page_obj,
        'bedroom_choices': bedroom_choices,
        'current_bedroom_filter': bedroom_filter,
        'current_price_filter': price_filter,
        'page_obj': page_obj
    }
    return render(request, 'EsHomesApp/apartments.html', context)

def apartment_detail(request, pk):
    apartment = get_object_or_404(Apartment, pk=pk)
    
    # Get similar apartments (same number of bedrooms, excluding current apartment)
    similar_apartments = Apartment.objects.filter(
        bedrooms=apartment.bedrooms,
        status='available'
    ).exclude(pk=pk)[:2]
    
    # Initialize booking form with the current apartment
    form = BookingForm(initial={'apartment': apartment})
    
    # Add apartment data for JavaScript
    apartments_data = {}
    image_url = apartment.images.first().image.url if apartment.images.exists() else None
    apartments_data[str(apartment.id)] = {
        'price': float(apartment.price_per_night),
        'name': apartment.name,
        'bedrooms': apartment.bedrooms,
        'bathrooms': apartment.bathrooms,
        'image_url': image_url
    }
    
    # Create a custom JSON encoder to handle Decimal objects
    class DecimalEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, decimal.Decimal):
                return float(obj)
            return super(DecimalEncoder, self).default(obj)
    
    form.fields['apartment'].widget.attrs['data-apartments'] = json.dumps(apartments_data, cls=DecimalEncoder)
    
    context = {
        'apartment': apartment,
        'similar_apartments': similar_apartments,
        'form': form,
    }
    
    return render(request, 'EsHomesApp/apartment-detail.html', context)

@login_required(login_url='/login_user')
def booking(request):
    apartment_id = request.GET.get('apartment')
    initial_data = {}
    
    if apartment_id:
        try:
            apartment = get_object_or_404(Apartment, pk=apartment_id)
            initial_data['apartment'] = apartment
        except:
            pass

    if request.method == 'POST':
        form = BookingForm(request.POST)
        print(request.POST)
        if form.is_valid():
            booking = form.save(commit=False)
            booking.user = request.user
            booking.status = 'pending'
            
            # Calculate total price
            nights = (booking.check_out_date - booking.check_in_date).days
            booking.total_price = nights * booking.apartment.price_per_night
            booking.save()

            # Create transaction
            tx_ref = f"ESHOMES-BKG-{booking.id}-{uuid.uuid4().hex[:10].upper()}"
            transaction = Transaction.objects.create(
                user=request.user,
                booking=booking,
                amount=booking.total_price,
                tx_ref=tx_ref,
                transaction_status='pending'
            )
            print(request.POST)

            messages.success(request, "Booking created. Proceeding to payment.")
            return redirect('initiate_payment', transaction_id=transaction.id)
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field.title()}: {error}")
    else:
        form = BookingForm(initial=initial_data)
        
        # Add apartment data for JavaScript
        apartments_data = {}
        for apartment in Apartment.objects.all():
            image_url = apartment.images.first().image.url if apartment.images.exists() else None
            apartments_data[str(apartment.id)] = {
                'price': float(apartment.price_per_night),
                'name': apartment.name,
                'bedrooms': apartment.bedrooms,
                'bathrooms': apartment.bathrooms,
                'image_url': image_url
            }
            
        # Create a custom JSON encoder to handle Decimal objects
        class DecimalEncoder(json.JSONEncoder):
            def default(self, obj):
                if isinstance(obj, decimal.Decimal):
                    return float(obj)
                return super(DecimalEncoder, self).default(obj)
        
        form.fields['apartment'].widget.attrs['data-apartments'] = json.dumps(apartments_data, cls=DecimalEncoder)
    
    context = {
        'form': form,
        'apartments': Apartment.objects.all().order_by('name'),
    }
    return render(request, 'EsHomesApp/booking.html', context)

def contact(request):
    return render(request, 'EsHomesApp/contact.html')

@login_required(login_url='/login_user')
def profile(request):
    bookings = Booking.objects.filter(user=request.user).order_by('-booking_date')
    context = {
        'user': request.user,
        'bookings': bookings,
    }
    return render(request, 'EsHomesApp/profile.html', context)

def login_user(request):
    if request.user.is_authenticated:
        return redirect('home')
    
    error_message = None
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        
        if not email or not password:
            error_message = 'Please enter both email and password.'
        else:
            user = authenticate(request, username=email, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'Welcome back, {user.first_name if user.first_name else user.username}!')
                return redirect('home')
            else:
                error_message = 'Invalid email or password.'
                messages.error(request, error_message)
    
    return render(request, 'EsHomesApp/login.html', {'error_message': error_message})

def logout_user(request):
    logout(request)
    messages.success(request, 'You have been logged out successfully.')
    return redirect('home')

def register(request):
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f'Welcome, {user.first_name}! Your account has been created successfully.')
            return redirect('home')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field.title()}: {error}')
    else:
        form = RegisterForm()
    
    return render(request, 'EsHomesApp/register.html', {'form': form})

@login_required(login_url='/login_user')
def create_booking(request, pk):
    apartment = get_object_or_404(Apartment, pk=pk)
    if request.method == 'POST':
        check_in = request.POST.get('check_in')
        check_out = request.POST.get('check_out')
        guests = request.POST.get('guests')
        special_requests = request.POST.get('special_requests', '')

        try:
            check_in_date = date.fromisoformat(check_in)
            check_out_date = date.fromisoformat(check_out)
            guests = int(guests)
        except (ValueError, TypeError):
            messages.error(request, "Invalid date or guest input.")
            return redirect('apartment_detail', pk=pk)

        if check_out_date <= check_in_date:
            messages.error(request, "Check-out date must be after check-in date.")
            return redirect('apartment_detail', pk=pk)

        if check_in_date < date.today():
            messages.error(request, "Check-in date cannot be in the past.")
            return redirect('apartment_detail', pk=pk)

        if guests > apartment.max_occupancy or guests < 1:
            messages.error(request, f"Number of guests must be between 1 and {apartment.max_occupancy}.")
            return redirect('apartment_detail', pk=pk)

        # Check for overlapping bookings
        overlapping_bookings = Booking.objects.filter(
            apartment=apartment,
            status__in=['pending', 'confirmed'],
            check_in_date__lt=check_out_date,
            check_out_date__gt=check_in_date
        ).exists()

        if overlapping_bookings:
            messages.error(request, "This apartment is not available for the selected dates.")
            return redirect('apartment_detail', pk=pk)

        if apartment.status != 'available':
            messages.error(request, "This apartment is not available for booking.")
            return redirect('apartment_detail', pk=pk)

        nights = (check_out_date - check_in_date).days
        total_price = nights * apartment.price_per_night

        booking = Booking.objects.create(
            user=request.user,
            apartment=apartment,
            check_in_date=check_in_date,
            check_out_date=check_out_date,
            guests=guests,
            total_price=total_price,
            special_requests=special_requests,
            status='pending'
        )

        tx_ref = f"ESHOMES-BKG-{booking.id}-{uuid.uuid4().hex[:10].upper()}"
        transaction = Transaction.objects.create(
            user=request.user,
            booking=booking,
            amount=total_price,
            tx_ref=tx_ref,
            transaction_status='pending'
        )

        messages.success(request, "Booking created. Proceeding to payment.")
        return redirect('initiate_payment', transaction_id=transaction.id)

    return redirect('apartment_detail', pk=pk)

@login_required(login_url='/login_user')
def initiate_payment(request, transaction_id):
    transaction = get_object_or_404(Transaction, id=transaction_id, user=request.user)
    booking = transaction.booking

    context = {
        'transaction': transaction,
        'booking': booking,
        'public_key': settings.FLUTTERWAVE_PUBLIC_KEY,
        'redirect_url': request.build_absolute_uri(reverse('payment_callback')),
        'customer': {
            'name': f"{request.user.first_name} {request.user.last_name}",
            'email': request.user.email,
        },
    }
    return render(request, 'EsHomesApp/initiate_payment.html', context)

@csrf_exempt
@require_http_methods(["GET", "POST"])
def payment_callback(request):
    if request.method == "POST":
        # Handle webhook
        try:
            webhook_data = json.loads(request.body)
            event_type = webhook_data.get('event')
            transaction_data = webhook_data.get('data', {})
            tx_ref = transaction_data.get('tx_ref')
            flw_transaction_id = transaction_data.get('id')
            status = transaction_data.get('status')

            transaction = get_object_or_404(Transaction, tx_ref=tx_ref)

            if event_type == 'charge.completed' and status in ['successful', 'completed']:
                verification_response = verify_transaction(flw_transaction_id)
                if (verification_response.get('status') == 'success' and
                    verification_response['data']['status'] in ['successful', 'completed'] and
                    verification_response['data']['amount'] == float(transaction.amount) and
                    verification_response['data']['currency'] == 'NGN'):

                    transaction.flw_transaction_id = flw_transaction_id
                    transaction.transaction_status = 'completed'
                    transaction.save()

                    booking = transaction.booking
                    booking.status = 'confirmed'
                    booking.save()

                    # Optionally update apartment status to 'reserved'
                    booking.apartment.status = 'reserved'
                    booking.apartment.save()

                    return HttpResponse(status=200)
                else:
                    transaction.transaction_status = 'declined'
                    transaction.save()
                    return HttpResponse(status=400)
            elif status == 'failed':
                transaction.transaction_status = 'declined'
                transaction.save()
                return HttpResponse(status=200)
            return HttpResponse(status=400)
        except Exception as e:
            print(f"Webhook error: {str(e)}")
            return HttpResponse(status=400)

    elif request.method == "GET":
        # Handle redirect
        status = request.GET.get('status')
        tx_ref = request.GET.get('tx_ref')
        flw_transaction_id = request.GET.get('transaction_id')

        try:
            transaction = Transaction.objects.get(tx_ref=tx_ref)
        except Transaction.DoesNotExist:
            messages.error(request, "Transaction not found.")
            return redirect('profile')

        if status in ['successful', 'completed']:
            verification_response = verify_transaction(flw_transaction_id)
            if (verification_response.get('status') == 'success' and
                verification_response['data']['status'] in ['successful', 'completed'] and
                verification_response['data']['amount'] == float(transaction.amount) and
                verification_response['data']['currency'] == 'NGN'):

                transaction.flw_transaction_id = flw_transaction_id
                transaction.transaction_status = 'completed'
                transaction.save()

                booking = transaction.booking
                booking.status = 'confirmed'
                booking.save()

                # Optionally update apartment status to 'reserved'
                booking.apartment.status = 'reserved'
                booking.apartment.save()

                messages.success(request, "Payment successful! Your booking is confirmed.")
                return redirect('thank_you', transaction_id=transaction.id)
            else:
                transaction.transaction_status = 'declined'
                transaction.save()
                messages.error(request, "Payment verification failed.")
        elif status == 'cancelled':
            transaction.transaction_status = 'declined'
            transaction.save()
            messages.error(request, "Payment was cancelled.")
        else:
            messages.error(request, f"Payment failed with status: {status}. Please try again.")

        # On failure/cancel, update booking to cancelled
        booking = transaction.booking
        booking.status = 'cancelled'
        booking.save()

        return redirect('profile')

def verify_transaction(flw_transaction_id):
    url = f"https://api.flutterwave.com/v3/transactions/{flw_transaction_id}/verify"
    headers = {
        'Authorization': f'Bearer {settings.FLUTTERWAVE_SECRET_KEY}',
        'Content-Type': 'application/json',
    }
    response = requests.get(url, headers=headers)
    return response.json()

@login_required(login_url='/login_user')
def thank_you(request, transaction_id):
    transaction = get_object_or_404(Transaction, id=transaction_id, user=request.user)
    booking = transaction.booking

    context = {
        'transaction': transaction,
        'booking': booking,
    }
    return render(request, 'EsHomesApp/thank_you.html', context)