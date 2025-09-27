from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser, Booking
from datetime import date

class RegisterForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = [
            'first_name', 'last_name', 'username', 'email', 'phone_number',
            'password1', 'password2'
        ]

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if CustomUser.objects.filter(email=email).exists():
            raise forms.ValidationError('This email address is already in use.')
        return email

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if CustomUser.objects.filter(username=username).exists():
            raise forms.ValidationError('This username is already taken.')
        return username

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
        return user

class BookingForm(forms.ModelForm):
    total_price = forms.DecimalField(widget=forms.HiddenInput(), required=False)
    
    class Meta:
        model = Booking
        fields = ['apartment', 'check_in_date', 'check_out_date', 'guests', 'special_requests']
        widgets = {
            'check_in_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'check_out_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'guests': forms.Select(attrs={'class': 'form-control'}, choices=[(i, f"{i} Guest{'s' if i > 1 else ''}") for i in range(1, 5)]),
            'special_requests': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'apartment': forms.Select(attrs={'class': 'form-control'}),
        }
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add price data to each apartment option
        if self.fields['apartment'].queryset.exists():
            choices = []
            for apartment in self.fields['apartment'].queryset:
                option_label = f"{apartment.name} - ₦{apartment.price_per_night}/night"
                choices.append((apartment.id, option_label))
            self.fields['apartment'].choices = choices

    def clean(self):
        cleaned_data = super().clean()
        check_in_date = cleaned_data.get('check_in_date')
        check_out_date = cleaned_data.get('check_out_date')
        apartment = cleaned_data.get('apartment')
        guests = cleaned_data.get('guests')

        if check_in_date and check_out_date:
            if check_in_date < date.today():
                raise forms.ValidationError("Check-in date cannot be in the past.")
            if check_out_date <= check_in_date:
                raise forms.ValidationError("Check-out date must be after check-in date.")

        if apartment and guests:
            if guests > apartment.max_occupancy:
                raise forms.ValidationError(f"Number of guests cannot exceed {apartment.max_occupancy} for this apartment.")

        return cleaned_data
        