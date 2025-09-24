from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class CustomUser(AbstractUser):
    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=20)
    username = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, null=True, unique=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)


    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.username} - {self.email}"

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

class Amenity(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, help_text="Font Awesome icon class")
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Amenities'

class Apartment(models.Model):
    APARTMENT_TYPES = [
        ('studio', 'Studio'),
        ('1bhk', '1 Bedroom'),
        ('2bhk', '2 Bedrooms'),
        ('3bhk', '3 Bedrooms'),
        ('penthouse', 'Penthouse'),
        ('duplex', 'Duplex'),
    ]

    STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('maintenance', 'Under Maintenance'),
        ('reserved', 'Reserved'),
    ]

    name = models.CharField(max_length=200)
    apartment_type = models.CharField(max_length=20, choices=APARTMENT_TYPES)
    description = models.TextField()
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    size_sqft = models.IntegerField()
    max_occupancy = models.IntegerField()
    bedrooms = models.IntegerField()
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    featured = models.BooleanField(default=False)
    amenities = models.ManyToManyField(Amenity)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.get_apartment_type_display()}"

    class Meta:
        ordering = ['-created_at']

class ApartmentImage(models.Model):
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='apartment_images/')
    is_primary = models.BooleanField(default=False)
    caption = models.CharField(max_length=200, blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.apartment.name} - {'Primary' if self.is_primary else 'Secondary'}"

    class Meta:
        ordering = ['-is_primary', '-upload_date']

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bookings')
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name='bookings')
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    guests = models.IntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    booking_date = models.DateTimeField(auto_now_add=True)
    special_requests = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking #{self.id} - {self.apartment.name} by {self.user.username}"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.check_out_date <= self.check_in_date:
            raise ValidationError("Check-out date must be after check-in date")
        if self.check_in_date < timezone.now().date():
            raise ValidationError("Check-in date cannot be in the past")
        if self.guests > self.apartment.max_occupancy:
            raise ValidationError(f"Maximum occupancy for this apartment is {self.apartment.max_occupancy}")

    class Meta:
        ordering = ['-booking_date']
        indexes = [
            models.Index(fields=['check_in_date', 'check_out_date']),
            models.Index(fields=['status']),
        ]

class Review(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reviews')
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name='reviews')
    booking = models.OneToOneField(Booking, on_delete=models.SET_NULL, null=True, blank=True)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    cleanliness_rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    location_rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    value_rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    helpful_votes = models.IntegerField(default=0)
    response = models.TextField(blank=True, null=True)
    response_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Review by {self.user.username} for {self.apartment.name}"

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'booking']  # One review per booking
        
# Add this at the end of models.py
import uuid

class Transaction(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('declined', 'Declined'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='transactions')
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='transaction', null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    tx_ref = models.CharField(max_length=100, unique=True)
    flw_transaction_id = models.CharField(max_length=100, blank=True, null=True)
    transaction_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def _str_(self):
        return f"Transaction {self.tx_ref} for {self.user.username}"

    class Meta:
        ordering = ['-created_at']