/**
 * Navigation Module
 * Handles mobile menu toggle, smooth scrolling, active section highlighting,
 * and keyboard accessibility for the navigation system.
 * 
 * @module navigation
 */

(function () {
  'use strict';

  // Configuration constants
  const CONFIG = {
    MOBILE_BREAKPOINT: 768,
    SCROLL_OFFSET: 100,
    INTERSECTION_THRESHOLD: 0.5,
    SCROLL_DEBOUNCE_DELAY: 100,
    ANIMATION_DURATION: 300,
  };

  // DOM element cache
  const elements = {
    hamburger: null,
    navMenu: null,
    navLinks: null,
    sections: null,
    nav: null,
  };

  // State management
  const state = {
    isMenuOpen: false,
    activeSection: null,
    isScrolling: false,
    scrollTimeout: null,
  };

  /**
   * Initialize the navigation module
   * Sets up event listeners and observers
   */
  function init() {
    try {
      cacheElements();
      validateElements();
      setupEventListeners();
      setupIntersectionObserver();
      updateActiveSection();
      logInfo('Navigation module initialized successfully');
    } catch (error) {
      logError('Failed to initialize navigation module', error);
    }
  }

  /**
   * Cache DOM elements for performance
   */
  function cacheElements() {
    elements.hamburger = document.querySelector('.hamburger');
    elements.navMenu = document.querySelector('.nav-menu');
    elements.navLinks = document.querySelectorAll('.nav-menu a');
    elements.sections = document.querySelectorAll('section[id]');
    elements.nav = document.querySelector('nav');
  }

  /**
   * Validate that required DOM elements exist
   * @throws {Error} If required elements are missing
   */
  function validateElements() {
    if (!elements.hamburger) {
      throw new Error('Hamburger menu button not found');
    }
    if (!elements.navMenu) {
      throw new Error('Navigation menu not found');
    }
    if (!elements.navLinks || elements.navLinks.length === 0) {
      throw new Error('Navigation links not found');
    }
    if (!elements.sections || elements.sections.length === 0) {
      logWarning('No sections found for active highlighting');
    }
  }

  /**
   * Set up all event listeners
   */
  function setupEventListeners() {
    // Hamburger menu toggle
    elements.hamburger.addEventListener('click', handleMenuToggle);

    // Navigation link clicks
    elements.navLinks.forEach((link) => {
      link.addEventListener('click', handleLinkClick);
    });

    // Close menu on escape key
    document.addEventListener('keydown', handleEscapeKey);

    // Close menu when clicking outside
    document.addEventListener('click', handleOutsideClick);

    // Handle window resize
    window.addEventListener('resize', handleResize);

    // Handle scroll for sticky navigation
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Keyboard navigation support
    elements.navLinks.forEach((link, index) => {
      link.addEventListener('keydown', (e) => handleKeyboardNavigation(e, index));
    });
  }

  /**
   * Toggle mobile menu open/closed
   * @param {Event} event - Click event
   */
  function handleMenuToggle(event) {
    event.stopPropagation();
    state.isMenuOpen = !state.isMenuOpen;
    updateMenuState();
    logInfo(`Menu ${state.isMenuOpen ? 'opened' : 'closed'}`);
  }

  /**
   * Update menu state and ARIA attributes
   */
  function updateMenuState() {
    elements.navMenu.classList.toggle('active', state.isMenuOpen);
    elements.hamburger.setAttribute('aria-expanded', state.isMenuOpen.toString());

    // Prevent body scroll when menu is open on mobile
    if (window.innerWidth < CONFIG.MOBILE_BREAKPOINT) {
      document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
    }

    // Focus management
    if (state.isMenuOpen) {
      const firstLink = elements.navLinks[0];
      if (firstLink) {
        setTimeout(() => firstLink.focus(), CONFIG.ANIMATION_DURATION);
      }
    }
  }

  /**
   * Handle navigation link clicks
   * @param {Event} event - Click event
   */
  function handleLinkClick(event) {
    const link = event.currentTarget;
    const href = link.getAttribute('href');

    // Only handle internal anchor links
    if (!href || !href.startsWith('#')) {
      return;
    }

    event.preventDefault();

    const targetId = href.substring(1);
    const targetSection = document.getElementById(targetId);

    if (!targetSection) {
      logWarning(`Target section not found: ${targetId}`);
      return;
    }

    // Close mobile menu
    if (state.isMenuOpen) {
      state.isMenuOpen = false;
      updateMenuState();
    }

    // Smooth scroll to section
    scrollToSection(targetSection);

    // Update active state
    updateActiveLink(link);

    logInfo(`Navigated to section: ${targetId}`);
  }

  /**
   * Scroll to a section with offset for fixed navigation
   * @param {HTMLElement} section - Target section element
   */
  function scrollToSection(section) {
    const navHeight = elements.nav ? elements.nav.offsetHeight : 0;
    const targetPosition = section.offsetTop - navHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    });
  }

  /**
   * Handle escape key to close mobile menu
   * @param {KeyboardEvent} event - Keyboard event
   */
  function handleEscapeKey(event) {
    if (event.key === 'Escape' && state.isMenuOpen) {
      state.isMenuOpen = false;
      updateMenuState();
      elements.hamburger.focus();
      logInfo('Menu closed via Escape key');
    }
  }

  /**
   * Handle clicks outside the menu to close it
   * @param {Event} event - Click event
   */
  function handleOutsideClick(event) {
    if (!state.isMenuOpen) {
      return;
    }

    const isClickInsideMenu = elements.navMenu.contains(event.target);
    const isClickOnHamburger = elements.hamburger.contains(event.target);

    if (!isClickInsideMenu && !isClickOnHamburger) {
      state.isMenuOpen = false;
      updateMenuState();
      logInfo('Menu closed via outside click');
    }
  }

  /**
   * Handle window resize events
   */
  function handleResize() {
    // Close mobile menu when resizing to desktop
    if (window.innerWidth >= CONFIG.MOBILE_BREAKPOINT && state.isMenuOpen) {
      state.isMenuOpen = false;
      updateMenuState();
    }

    // Reset body overflow
    if (window.innerWidth >= CONFIG.MOBILE_BREAKPOINT) {
      document.body.style.overflow = '';
    }
  }

  /**
   * Handle scroll events for sticky navigation
   */
  function handleScroll() {
    if (!elements.nav) {
      return;
    }

    // Add scrolled class for styling
    if (window.scrollY > CONFIG.SCROLL_OFFSET) {
      elements.nav.classList.add('scrolled');
    } else {
      elements.nav.classList.remove('scrolled');
    }

    // Debounce scroll event for performance
    clearTimeout(state.scrollTimeout);
    state.scrollTimeout = setTimeout(() => {
      state.isScrolling = false;
    }, CONFIG.SCROLL_DEBOUNCE_DELAY);

    state.isScrolling = true;
  }

  /**
   * Handle keyboard navigation within menu
   * @param {KeyboardEvent} event - Keyboard event
   * @param {number} currentIndex - Current link index
   */
  function handleKeyboardNavigation(event, currentIndex) {
    const linksArray = Array.from(elements.navLinks);
    let targetIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        targetIndex = (currentIndex + 1) % linksArray.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        targetIndex = (currentIndex - 1 + linksArray.length) % linksArray.length;
        break;
      case 'Home':
        event.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        targetIndex = linksArray.length - 1;
        break;
      default:
        return;
    }

    linksArray[targetIndex].focus();
  }

  /**
   * Set up Intersection Observer for active section detection
   */
  function setupIntersectionObserver() {
    if (!elements.sections || elements.sections.length === 0) {
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: CONFIG.INTERSECTION_THRESHOLD,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('id');
          updateActiveSectionById(sectionId);
        }
      });
    }, observerOptions);

    elements.sections.forEach((section) => {
      observer.observe(section);
    });

    logInfo('Intersection Observer initialized for active section detection');
  }

  /**
   * Update active section by ID
   * @param {string} sectionId - Section ID
   */
  function updateActiveSectionById(sectionId) {
    if (state.activeSection === sectionId) {
      return;
    }

    state.activeSection = sectionId;

    elements.navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${sectionId}`) {
        updateActiveLink(link);
      }
    });

    logInfo(`Active section updated: ${sectionId}`);
  }

  /**
   * Update active link styling
   * @param {HTMLElement} activeLink - Link to mark as active
   */
  function updateActiveLink(activeLink) {
    elements.navLinks.forEach((link) => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });

    activeLink.classList.add('active');
    activeLink.setAttribute('aria-current', 'page');
  }

  /**
   * Update active section based on scroll position (fallback)
   */
  function updateActiveSection() {
    if (!elements.sections || elements.sections.length === 0) {
      return;
    }

    const scrollPosition = window.scrollY + window.innerHeight / 3;

    elements.sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        updateActiveSectionById(sectionId);
      }
    });
  }

  /**
   * Log informational message
   * @param {string} message - Log message
   */
  function logInfo(message) {
    if (console && console.log) {
      console.log(`[Navigation] ${message}`);
    }
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   */
  function logWarning(message) {
    if (console && console.warn) {
      console.warn(`[Navigation] ${message}`);
    }
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Error} error - Error object
   */
  function logError(message, error) {
    if (console && console.error) {
      console.error(`[Navigation] ${message}`, error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API for testing and external access
  window.Navigation = {
    closeMenu: function () {
      if (state.isMenuOpen) {
        state.isMenuOpen = false;
        updateMenuState();
      }
    },
    openMenu: function () {
      if (!state.isMenuOpen) {
        state.isMenuOpen = true;
        updateMenuState();
      }
    },
    getActiveSection: function () {
      return state.activeSection;
    },
  };
})();