from django.urls import path
from . import views
from django.contrib.auth import views as auth_views


# Create your views here.
urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('apartments/', views.apartments, name='apartments'),
    path('apartment/<int:pk>/', views.apartment_detail, name='apartment_detail'),
    path('booking/', views.booking, name='booking'),
    path('contact/', views.contact, name='contact'),
    path('login/', views.login_user, name='user_login'),
    path('profile/', views.profile, name='profile'),
    path('register/', views.register, name='register'),
    path('logout_user', views.logout_user, name='logout_user'),
    path('login_user', views.login_user, name='login_user'),
    path('apartment/<int:pk>/book/', views.create_booking, name='create_booking'),
    path('payment/initiate/<int:transaction_id>/', views.initiate_payment, name='initiate_payment'),
    path('payment-callback/', views.payment_callback, name='payment_callback'),
    path('thank-you/<int:transaction_id>/', views.thank_you, name='thank_you'),


]

