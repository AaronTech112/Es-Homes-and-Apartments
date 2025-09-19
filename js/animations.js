/**
 * ES Homes & Apartments - Animations JavaScript
 * This file contains all the animation functionality for the website
 */

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // Initialize all animations
  initScrollAnimations();
  initHoverAnimations();
  initTextAnimations();
  initParallaxEffect();
  initCounterAnimations();
  initLoaderAnimations();
  initSmoothScrolling();
});

/**
 * Scroll Animations
 * Reveals elements as they enter the viewport
 */
function initScrollAnimations() {
  // Get all elements with animation classes
  const animatedElements = document.querySelectorAll('.animate, .reveal-up, .reveal-down, .reveal-left, .reveal-right, .fade-in, .scale-in, .rotate-in, .flip-in, .scroll-animate');
  
  // Create Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // If element is in viewport
      if (entry.isIntersecting) {
        // Add active class to animated elements
        entry.target.classList.add('active');
        
        // Unobserve element after animation if it's not infinite
        if (!entry.target.classList.contains('animate--infinite')) {
          observer.unobserve(entry.target);
        }
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  });
  
  // Observe all animated elements
  animatedElements.forEach(element => {
    observer.observe(element);
  });
}

/**
 * Smooth Scrolling
 * Enables smooth scrolling to anchor links
 */
function initSmoothScrolling() {
  // Select all anchor links that start with # but are not just #
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Get header height for offset
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = targetPosition - headerHeight - 20; // 20px extra padding
        
        // Smooth scroll to target
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Back to top button smooth scroll
  const backToTopBtn = document.getElementById('back-to-top');
  
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/**
 * Helper function to check if element is in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom >= 0 &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
    rect.right >= 0
  );
}

/**
 * Hover Animations
 * Adds interactive animations on hover
 */
function initHoverAnimations() {
  // Apartment cards hover effect
  const apartmentCards = document.querySelectorAll('.apartment-card');
  
  apartmentCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.classList.add('hover-active');
    });
    
    card.addEventListener('mouseleave', function() {
      this.classList.remove('hover-active');
    });
  });
  
  // Button hover effects
  const buttons = document.querySelectorAll('.btn');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.classList.add('btn-hover');
    });
    
    button.addEventListener('mouseleave', function() {
      this.classList.remove('btn-hover');
    });
  });
  
  // Image hover effects
  const hoverImages = document.querySelectorAll('.img-zoom, .img-rotate');
  
  hoverImages.forEach(image => {
    image.addEventListener('mouseenter', function() {
      this.classList.add('hover-active');
    });
    
    image.addEventListener('mouseleave', function() {
      this.classList.remove('hover-active');
    });
  });
}

/**
 * Text Animations
 * Animates text elements for emphasis
 */
function initTextAnimations() {
  // Typewriter effect
  const typewriterElements = document.querySelectorAll('.typewriter');
  
  typewriterElements.forEach(element => {
    const text = element.textContent;
    element.textContent = '';
    element.style.display = 'inline-block';
    
    let i = 0;
    const speed = element.dataset.speed || 100;
    
    function typeWriter() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
      }
    }
    
    // Start typewriter when element is in viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          typeWriter();
          observer.unobserve(element);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(element);
  });
  
  // Text highlight effect
  const highlightElements = document.querySelectorAll('.highlight-text');
  
  highlightElements.forEach(element => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          element.classList.add('active');
          observer.unobserve(element);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(element);
  });
}

/**
 * Parallax Effect
 * Creates depth with parallax scrolling
 */
function initParallaxEffect() {
  const parallaxElements = document.querySelectorAll('.parallax');
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset;
    
    parallaxElements.forEach(element => {
      const speed = element.dataset.speed || 0.5;
      const offset = scrollTop * speed;
      
      element.style.backgroundPositionY = `calc(50% + ${offset}px)`;
    });
  });
}

/**
 * Counter Animations
 * Animates number counters
 */
function initCounterAnimations() {
  const counterElements = document.querySelectorAll('.counter');
  
  counterElements.forEach(counter => {
    const target = parseInt(counter.dataset.target);
    const duration = parseInt(counter.dataset.duration) || 2000;
    const increment = target / (duration / 16); // 60fps
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          let current = 0;
          
          const updateCounter = () => {
            current += increment;
            
            if (current < target) {
              counter.textContent = Math.ceil(current);
              requestAnimationFrame(updateCounter);
            } else {
              counter.textContent = target;
            }
          };
          
          updateCounter();
          observer.unobserve(counter);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(counter);
  });
}

/**
 * Loader Animations
 * Animates loading indicators
 */
function initLoaderAnimations() {
  // Animated progress bars
  const progressBars = document.querySelectorAll('.progress-bar');
  
  progressBars.forEach(bar => {
    const target = parseInt(bar.dataset.progress);
    const duration = parseInt(bar.dataset.duration) || 1500;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          bar.style.transition = `width ${duration}ms ease-in-out`;
          bar.style.width = `${target}%`;
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(bar);
  });
  
  // Loading spinners
  const spinners = document.querySelectorAll('.loading-spinner');
  
  spinners.forEach(spinner => {
    spinner.style.display = 'inline-block';
  });
}

/**
 * 3D Card Effect
 * Creates a 3D tilt effect on cards
 */
function init3DCardEffect() {
  const cards = document.querySelectorAll('.card-3d');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
  });
}

/**
 * Scroll Progress Indicator
 * Shows reading progress on scroll
 */
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress');
  
  if (!progressBar) return;
  
  window.addEventListener('scroll', function() {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    
    progressBar.style.width = `${scrolled}%`;
  });
}

/**
 * Initialize all animations when document is ready
 */
document.addEventListener('DOMContentLoaded', function() {
  initScrollAnimations();
  initHoverAnimations();
  initTextAnimations();
  initParallaxEffect();
  initCounterAnimations();
  initLoaderAnimations();
  init3DCardEffect();
  initScrollProgress();
});