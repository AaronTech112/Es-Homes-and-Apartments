/**
 * ES Homes & Apartments - Main JavaScript
 * This file contains all the main functionality for the website
 */

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // Initialize all components
  initHeader();
  initHeroSlider();
  initTestimonialSlider();
  initScrollReveal();
  initBackToTop();
  
  // Initialize mobile navigation with a slight delay to ensure DOM is fully loaded
  setTimeout(initMobileNav, 100);
});

/**
 * Header scroll effect
 */
function initHeader() {
  const header = document.querySelector('.header');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/**
 * Mobile Navigation
 */
function initMobileNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('#nav-list');
  
  if (!navToggle || !navList) {
    console.error('Mobile navigation elements not found');
    return;
  }
  
  // Toggle mobile menu when clicking the hamburger icon
  navToggle.addEventListener('click', function(e) {
    e.preventDefault();
    navToggle.classList.toggle('active');
    navList.classList.toggle('active');
    
    // Toggle aria-expanded attribute for accessibility
    const expanded = navToggle.getAttribute('aria-expanded') === 'true' || false;
    navToggle.setAttribute('aria-expanded', !expanded);
  });
    
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!navToggle.contains(e.target) && !navList.contains(e.target) && navList.classList.contains('active')) {
      navToggle.classList.remove('active');
      navList.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
    
  // Close mobile menu when clicking on a nav link or the mobile book button
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileBookBtn = document.querySelector('.mobile-book-btn .mobile-btn');
    
  // Add event listeners to all navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navToggle.classList.remove('active');
      navList.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
    
  // Add event listener to mobile book button if it exists
  if (mobileBookBtn) {
    mobileBookBtn.addEventListener('click', function() {
      navToggle.classList.remove('active');
      navList.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  }
    
  // Close mobile menu when window is resized to desktop size
  window.addEventListener('resize', function() {
    if (window.innerWidth > 992 && navList.classList.contains('active')) {
      navToggle.classList.remove('active');
      navList.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}
/**
 * Hero Slider
 */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  const prevBtn = document.querySelector('.hero-prev');
  const nextBtn = document.querySelector('.hero-next');
  let currentSlide = 0;
  let slideInterval;
  
  // Skip if no slides
  if (slides.length === 0) return;
  
  // Function to show a specific slide
  function showSlide(index) {
    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Add active class to current slide and dot
    slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    
    // Update current slide index
    currentSlide = index;
  }
  
  // Function to show next slide
  function nextSlide() {
    let next = currentSlide + 1;
    if (next >= slides.length) next = 0;
    showSlide(next);
  }
  
  // Function to show previous slide
  function prevSlide() {
    let prev = currentSlide - 1;
    if (prev < 0) prev = slides.length - 1;
    showSlide(prev);
  }
  
  // Event listeners for next and previous buttons
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      nextSlide();
      resetInterval();
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      prevSlide();
      resetInterval();
    });
  }
  
  // Event listeners for dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', function() {
      showSlide(index);
      resetInterval();
    });
  });
  
  // Auto slide
  function startInterval() {
    slideInterval = setInterval(nextSlide, 5000);
  }
  
  function resetInterval() {
    clearInterval(slideInterval);
    startInterval();
  }
  
  // Initialize slider
  showSlide(0);
  startInterval();
}

/**
 * Testimonial Slider
 */
function initTestimonialSlider() {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.testimonial-dot');
  const prevBtn = document.querySelector('.testimonial-prev');
  const nextBtn = document.querySelector('.testimonial-next');
  let currentSlide = 0;
  let slideInterval;
  
  // Skip if no slides
  if (slides.length === 0) return;
  
  // Function to show a specific slide
  function showSlide(index) {
    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Add active class to current slide and dot
    slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    
    // Update current slide index
    currentSlide = index;
  }
  
  // Function to show next slide
  function nextSlide() {
    let next = currentSlide + 1;
    if (next >= slides.length) next = 0;
    showSlide(next);
  }
  
  // Function to show previous slide
  function prevSlide() {
    let prev = currentSlide - 1;
    if (prev < 0) prev = slides.length - 1;
    showSlide(prev);
  }
  
  // Event listeners for next and previous buttons
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      nextSlide();
      resetInterval();
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      prevSlide();
      resetInterval();
    });
  }
  
  // Event listeners for dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', function() {
      showSlide(index);
      resetInterval();
    });
  });
  
  // Auto slide
  function startInterval() {
    slideInterval = setInterval(nextSlide, 6000);
  }
  
  function resetInterval() {
    clearInterval(slideInterval);
    startInterval();
  }
  
  // Initialize slider
  showSlide(0);
  startInterval();
}

/**
 * Scroll Reveal Animation
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up');
  
  function checkReveal() {
    const windowHeight = window.innerHeight;
    const revealPoint = 150;
    
    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      
      if (elementTop < windowHeight - revealPoint) {
        element.classList.add('active');
      }
    });
  }
  
  // Check on load
  checkReveal();
  
  // Check on scroll
  window.addEventListener('scroll', checkReveal);
}

/**
 * Back to Top Button
 */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  
  if (!backToTopBtn) return;
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('active');
    } else {
      backToTopBtn.classList.remove('active');
    }
  });
  
  backToTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Form Validation
 */
function validateForm(formId) {
  const form = document.getElementById(formId);
  
  if (!form) return false;
  
  const inputs = form.querySelectorAll('input, textarea, select');
  let isValid = true;
  
  inputs.forEach(input => {
    if (input.hasAttribute('required') && !input.value.trim()) {
      isValid = false;
      input.classList.add('error');
    } else {
      input.classList.remove('error');
    }
    
    // Email validation
    if (input.type === 'email' && input.value.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(input.value)) {
        isValid = false;
        input.classList.add('error');
      }
    }
  });
  
  return isValid;
}

/**
 * Booking Date Validation
 */
function validateBookingDates(checkInId, checkOutId) {
  const checkIn = document.getElementById(checkInId);
  const checkOut = document.getElementById(checkOutId);
  
  if (!checkIn || !checkOut) return false;
  
  const checkInDate = new Date(checkIn.value);
  const checkOutDate = new Date(checkOut.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (checkInDate < today) {
    checkIn.classList.add('error');
    return false;
  }
  
  if (checkOutDate <= checkInDate) {
    checkOut.classList.add('error');
    return false;
  }
  
  checkIn.classList.remove('error');
  checkOut.classList.remove('error');
  return true;
}

/**
 * Calculate Booking Price
 */
function calculateBookingPrice(checkInId, checkOutId, pricePerNight, totalPriceId) {
  const checkIn = document.getElementById(checkInId);
  const checkOut = document.getElementById(checkOutId);
  const totalPriceElement = document.getElementById(totalPriceId);
  
  if (!checkIn || !checkOut || !totalPriceElement) return;
  
  const checkInDate = new Date(checkIn.value);
  const checkOutDate = new Date(checkOut.value);
  
  if (checkInDate && checkOutDate && checkOutDate > checkInDate) {
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * pricePerNight;
    totalPriceElement.textContent = `₦${totalPrice.toLocaleString()}`;
  } else {
    totalPriceElement.textContent = '₦0';
  }
}

/**
 * Filter Apartments
 */
function filterApartments() {
  const filterForm = document.getElementById('filter-form');
  const apartments = document.querySelectorAll('.apartment-card');
  
  if (!filterForm || apartments.length === 0) return;
  
  filterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const bedroomFilter = document.getElementById('bedroom-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    
    apartments.forEach(apartment => {
      let showApartment = true;
      
      // Filter by bedrooms
      if (bedroomFilter !== 'all') {
        const bedrooms = apartment.getAttribute('data-bedrooms');
        if (bedrooms !== bedroomFilter) {
          showApartment = false;
        }
      }
      
      // Filter by price
      if (priceFilter !== 'all' && showApartment) {
        const price = parseInt(apartment.getAttribute('data-price'));
        
        switch (priceFilter) {
          case 'low':
            if (price > 100000) showApartment = false;
            break;
          case 'medium':
            if (price < 100000 || price > 200000) showApartment = false;
            break;
          case 'high':
            if (price < 200000) showApartment = false;
            break;
        }
      }
      
      // Show or hide apartment
      if (showApartment) {
        apartment.style.display = 'block';
      } else {
        apartment.style.display = 'none';
      }
    });
  });
}

/**
 * Image Gallery
 */
function initImageGallery() {
  const galleryThumbs = document.querySelectorAll('.gallery-thumb');
  const mainImage = document.querySelector('.gallery-main-image');
  
  if (!galleryThumbs.length || !mainImage) return;
  
  galleryThumbs.forEach(thumb => {
    thumb.addEventListener('click', function() {
      // Remove active class from all thumbnails
      galleryThumbs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked thumbnail
      this.classList.add('active');
      
      // Update main image
      const imgSrc = this.getAttribute('data-src');
      mainImage.src = imgSrc;
      
      // Add fade animation
      mainImage.classList.remove('fadeIn');
      void mainImage.offsetWidth; // Trigger reflow
      mainImage.classList.add('fadeIn');
    });
  });
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Preloader
 */
function initPreloader() {
  const preloader = document.querySelector('.preloader');
  
  if (!preloader) return;
  
  window.addEventListener('load', function() {
    preloader.classList.add('fade-out');
    
    setTimeout(function() {
      preloader.style.display = 'none';
    }, 500);
  });
}

/**
 * Lazy Loading Images
 */
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    lazyImages.forEach(img => {
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    });
  }
}

/**
 * Initialize all components when document is ready
 */
document.addEventListener('DOMContentLoaded', function() {
  initHeader();
  initHeroSlider();
  initTestimonialSlider();
  initScrollReveal();
  initBackToTop();
  initMobileNav();
  initSmoothScroll();
  initPreloader();
  initLazyLoading();
  filterApartments();
  initImageGallery();
});