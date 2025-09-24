from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser, Apartment, ApartmentImage,
    Amenity, Booking, Review, Transaction   
)

admin.site.register(Transaction)

class ApartmentImageInline(admin.TabularInline):
    model = ApartmentImage
    extra = 1
    fields = ['image', 'is_primary', 'caption']

class BookingInline(admin.TabularInline):
    model = Booking
    extra = 0
    readonly_fields = ['booking_date', 'last_updated']
    fields = ['user', 'check_in_date', 'check_out_date', 'guests', 'total_price', 'status']

class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0
    readonly_fields = ['created_at', 'updated_at']
    fields = ['user', 'rating', 'comment', 'helpful_votes']

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_active']
    list_filter = ['is_active', 'is_staff', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Information', {
            'fields': ('phone_number', 'profile_picture', 'bio'),
        }),
    )

@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'apartment_type', 'price_per_night', 'status', 'featured']
    list_filter = ['status', 'apartment_type', 'featured']
    search_fields = ['name', 'description']
    filter_horizontal = ['amenities']
    inlines = [ApartmentImageInline, BookingInline, ReviewInline]
    list_editable = ['status', 'featured']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'apartment_type', 'description', 'featured')
        }),
        ('Specifications', {
            'fields': ('price_per_night', 'size_sqft', 'max_occupancy', 'bedrooms', 'bathrooms')
        }),
        ('Status & Dates', {
            'fields': ('status', 'created_at', 'updated_at')
        }),
        ('Features', {
            'fields': ('amenities',)
        })
    )

@admin.register(ApartmentImage)
class ApartmentImageAdmin(admin.ModelAdmin):
    list_display = ['apartment', 'is_primary', 'caption', 'upload_date']
    list_filter = ['is_primary', 'upload_date']
    search_fields = ['apartment__name', 'caption']
    readonly_fields = ['upload_date']

@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon']
    search_fields = ['name', 'description']

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'apartment', 'check_in_date', 'check_out_date', 'status']
    list_filter = ['status', 'check_in_date', 'check_out_date']
    search_fields = ['user__username', 'user__email', 'apartment__name']
    readonly_fields = ['booking_date', 'last_updated']
    fieldsets = (
        ('Booking Information', {
            'fields': ('user', 'apartment', 'status')
        }),
        ('Dates', {
            'fields': ('check_in_date', 'check_out_date', 'booking_date', 'last_updated')
        }),
        ('Details', {
            'fields': ('guests', 'total_price', 'special_requests', 'cancellation_reason')
        })
    )

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'apartment', 'rating', 'created_at', 'helpful_votes']
    list_filter = ['rating', 'created_at']
    search_fields = ['user__username', 'apartment__name', 'comment']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Review Information', {
            'fields': ('user', 'apartment', 'booking')
        }),
        ('Ratings', {
            'fields': ('rating', 'cleanliness_rating', 'location_rating', 'value_rating')
        }),
        ('Content', {
            'fields': ('comment', 'helpful_votes')
        }),
        ('Management Response', {
            'fields': ('response', 'response_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        })
    )