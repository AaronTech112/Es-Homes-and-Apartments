import os
import django
from decimal import Decimal

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'EsHomesProject.settings')
django.setup()

from EsHomesApp.models import Apartment, Amenity, ApartmentImage
from django.core.files import File
from django.conf import settings
import shutil
from pathlib import Path

def create_amenities():
    amenities = [
        ('Wi-Fi', 'fas fa-wifi', 'High-speed wireless internet'),
        ('Parking', 'fas fa-parking', 'Secure parking space'),
        ('Pool', 'fas fa-swimming-pool', 'Swimming pool access'),
        ('Gym', 'fas fa-dumbbell', 'Fully equipped fitness center'),
        ('Air Conditioning', 'fas fa-snowflake', 'Climate control'),
        ('Kitchen', 'fas fa-utensils', 'Fully equipped kitchen'),
        ('TV', 'fas fa-tv', 'Smart TV with cable'),
        ('Laundry', 'fas fa-washer', 'In-unit washer and dryer'),
        ('Security', 'fas fa-shield-alt', '24/7 security service'),
        ('Balcony', 'fas fa-door-open', 'Private balcony or terrace')
    ]
    
    created_amenities = []
    for name, icon, description in amenities:
        amenity, created = Amenity.objects.get_or_create(
            name=name,
            defaults={
                'icon': icon,
                'description': description
            }
        )
        created_amenities.append(amenity)
    return created_amenities

def create_apartments(amenities):
    apartments = [
        {
            'name': 'Luxury Ocean View Penthouse',
            'apartment_type': 'penthouse',
            'description': 'Stunning penthouse with panoramic ocean views, featuring modern design and luxury finishes.',
            'price_per_night': Decimal('500.00'),
            'size_sqft': 2000,
            'max_occupancy': 6,
            'bedrooms': 3,
            'bathrooms': Decimal('3.5'),
            'status': 'available',
            'featured': True,
            'amenities': amenities
        },
        {
            'name': 'Cozy Studio Downtown',
            'apartment_type': 'studio',
            'description': 'Modern studio apartment in the heart of downtown, perfect for solo travelers or couples.',
            'price_per_night': Decimal('150.00'),
            'size_sqft': 500,
            'max_occupancy': 2,
            'bedrooms': 1,
            'bathrooms': Decimal('1.0'),
            'status': 'available',
            'featured': True,
            'amenities': amenities[:5]  # First 5 amenities
        },
        {
            'name': 'Family-Friendly 3BHK Suite',
            'apartment_type': '3bhk',
            'description': 'Spacious 3-bedroom apartment ideal for families, with a fully equipped kitchen and play area.',
            'price_per_night': Decimal('350.00'),
            'size_sqft': 1500,
            'max_occupancy': 8,
            'bedrooms': 3,
            'bathrooms': Decimal('2.0'),
            'status': 'available',
            'featured': True,
            'amenities': amenities[2:8]  # Mix of amenities
        },
        {
            'name': 'Executive 2BHK Apartment',
            'apartment_type': '2bhk',
            'description': 'Modern 2-bedroom apartment with a home office setup, perfect for business travelers.',
            'price_per_night': Decimal('250.00'),
            'size_sqft': 1200,
            'max_occupancy': 4,
            'bedrooms': 2,
            'bathrooms': Decimal('2.0'),
            'status': 'available',
            'featured': False,
            'amenities': amenities[::2]  # Every other amenity
        },
        {
            'name': 'Deluxe 1BHK Suite',
            'apartment_type': '1bhk',
            'description': 'Elegant 1-bedroom suite with city views and modern amenities.',
            'price_per_night': Decimal('200.00'),
            'size_sqft': 800,
            'max_occupancy': 3,
            'bedrooms': 1,
            'bathrooms': Decimal('1.5'),
            'status': 'available',
            'featured': False,
            'amenities': amenities[-5:]  # Last 5 amenities
        }
    ]
    
    created_apartments = []
    for apt_data in apartments:
        amenities_list = apt_data.pop('amenities')
        apartment = Apartment.objects.create(**apt_data)
        apartment.amenities.set(amenities_list)
        created_apartments.append(apartment)
    return created_apartments

def setup_sample_data():
    print("Creating amenities...")
    amenities = create_amenities()
    print("Created amenities successfully!")

    print("Creating apartments...")
    apartments = create_apartments(amenities)
    print("Created apartments successfully!")

    print("Sample data has been populated!")
    return apartments

if __name__ == '__main__':
    setup_sample_data()