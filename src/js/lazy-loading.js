/**
 * Lazy Loading Implementation using Intersection Observer API
 * Provides progressive image loading with fallback support for older browsers
 * Optimizes performance by loading images only when they enter the viewport
 */

(function () {
  'use strict';

  /**
   * Configuration object for lazy loading behavior
   */
  const CONFIG = {
    rootMargin: '50px 0px',
    threshold: 0.01,
    loadingClass: 'lazy-loading',
    loadedClass: 'lazy-loaded',
    errorClass: 'lazy-error',
    placeholderClass: 'lazy-placeholder',
    imageSelector: 'img[loading="lazy"]',
    retryAttempts: 3,
    retryDelay: 1000,
  };

  /**
   * Logger utility for structured logging
   */
  const Logger = {
    log(message, context = {}) {
      if (typeof console !== 'undefined' && console.log) {
        console.log(`[LazyLoading] ${message}`, context);
      }
    },
    warn(message, context = {}) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(`[LazyLoading] ${message}`, context);
      }
    },
    error(message, error, context = {}) {
      if (typeof console !== 'undefined' && console.error) {
        console.error(`[LazyLoading] ${message}`, { error, ...context });
      }
    },
  };

  /**
   * Image loading state manager
   */
  class ImageLoader {
    constructor(img, config) {
      this.img = img;
      this.config = config;
      this.attempts = 0;
      this.loaded = false;
    }

    /**
     * Load image with retry logic
     */
    async load() {
      if (this.loaded) {
        return true;
      }

      const src = this.img.dataset.src || this.img.getAttribute('src');
      if (!src) {
        Logger.warn('Image has no source', { img: this.img });
        return false;
      }

      this.img.classList.add(this.config.loadingClass);

      try {
        await this.loadWithRetry(src);
        this.onLoadSuccess(src);
        return true;
      } catch (error) {
        this.onLoadError(error, src);
        return false;
      }
    }

    /**
     * Load image with retry mechanism
     */
    loadWithRetry(src) {
      return new Promise((resolve, reject) => {
        const attemptLoad = () => {
          this.attempts++;

          const tempImg = new Image();

          tempImg.onload = () => {
            this.img.src = src;
            if (this.img.srcset && this.img.dataset.srcset) {
              this.img.srcset = this.img.dataset.srcset;
            }
            resolve();
          };

          tempImg.onerror = () => {
            if (this.attempts < this.config.retryAttempts) {
              Logger.warn(`Image load failed, retrying (${this.attempts}/${this.config.retryAttempts})`, {
                src,
                attempt: this.attempts,
              });
              setTimeout(attemptLoad, this.config.retryDelay * this.attempts);
            } else {
              reject(new Error(`Failed to load image after ${this.attempts} attempts`));
            }
          };

          tempImg.src = src;
        };

        attemptLoad();
      });
    }

    /**
     * Handle successful image load
     */
    onLoadSuccess(src) {
      this.loaded = true;
      this.img.classList.remove(this.config.loadingClass);
      this.img.classList.remove(this.config.placeholderClass);
      this.img.classList.add(this.config.loadedClass);
      this.img.removeAttribute('data-src');
      this.img.removeAttribute('data-srcset');

      Logger.log('Image loaded successfully', { src });

      const event = new CustomEvent('lazyloaded', {
        detail: { img: this.img, src },
        bubbles: true,
      });
      this.img.dispatchEvent(event);
    }

    /**
     * Handle image load error
     */
    onLoadError(error, src) {
      this.img.classList.remove(this.config.loadingClass);
      this.img.classList.add(this.config.errorClass);

      Logger.error('Image failed to load', error, { src, attempts: this.attempts });

      const event = new CustomEvent('lazyerror', {
        detail: { img: this.img, src, error },
        bubbles: true,
      });
      this.img.dispatchEvent(event);
    }
  }

  /**
   * Intersection Observer based lazy loader
   */
  class IntersectionObserverLazyLoader {
    constructor(config) {
      this.config = config;
      this.observer = null;
      this.images = new Map();
      this.initialized = false;
    }

    /**
     * Initialize the lazy loader
     */
    init() {
      if (this.initialized) {
        Logger.warn('Lazy loader already initialized');
        return;
      }

      try {
        this.observer = new IntersectionObserver(
          this.handleIntersection.bind(this),
          {
            rootMargin: this.config.rootMargin,
            threshold: this.config.threshold,
          }
        );

        this.observeImages();
        this.initialized = true;

        Logger.log('Intersection Observer lazy loader initialized', {
          imageCount: this.images.size,
        });
      } catch (error) {
        Logger.error('Failed to initialize Intersection Observer', error);
        throw error;
      }
    }

    /**
     * Observe all lazy-loadable images
     */
    observeImages() {
      const images = document.querySelectorAll(this.config.imageSelector);

      images.forEach((img) => {
        if (!this.images.has(img)) {
          const loader = new ImageLoader(img, this.config);
          this.images.set(img, loader);
          this.observer.observe(img);
          img.classList.add(this.config.placeholderClass);
        }
      });

      Logger.log('Observing images', { count: images.length });
    }

    /**
     * Handle intersection events
     */
    handleIntersection(entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const loader = this.images.get(img);

          if (loader && !loader.loaded) {
            loader.load().then((success) => {
              if (success) {
                this.observer.unobserve(img);
              }
            });
          }
        }
      });
    }

    /**
     * Refresh observer to detect new images
     */
    refresh() {
      this.observeImages();
    }

    /**
     * Destroy the lazy loader
     */
    destroy() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      this.images.clear();
      this.initialized = false;

      Logger.log('Lazy loader destroyed');
    }
  }

  /**
   * Fallback lazy loader for browsers without Intersection Observer
   */
  class FallbackLazyLoader {
    constructor(config) {
      this.config = config;
      this.images = new Map();
      this.initialized = false;
      this.throttleTimeout = null;
    }

    /**
     * Initialize the fallback lazy loader
     */
    init() {
      if (this.initialized) {
        Logger.warn('Fallback lazy loader already initialized');
        return;
      }

      this.collectImages();
      this.attachScrollListener();
      this.checkVisibleImages();
      this.initialized = true;

      Logger.log('Fallback lazy loader initialized', {
        imageCount: this.images.size,
      });
    }

    /**
     * Collect all lazy-loadable images
     */
    collectImages() {
      const images = document.querySelectorAll(this.config.imageSelector);

      images.forEach((img) => {
        if (!this.images.has(img)) {
          const loader = new ImageLoader(img, this.config);
          this.images.set(img, loader);
          img.classList.add(this.config.placeholderClass);
        }
      });
    }

    /**
     * Attach scroll and resize listeners
     */
    attachScrollListener() {
      const handleScroll = () => {
        if (this.throttleTimeout) {
          return;
        }

        this.throttleTimeout = setTimeout(() => {
          this.checkVisibleImages();
          this.throttleTimeout = null;
        }, 100);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll, { passive: true });
    }

    /**
     * Check which images are visible in viewport
     */
    checkVisibleImages() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      this.images.forEach((loader, img) => {
        if (loader.loaded) {
          return;
        }

        const rect = img.getBoundingClientRect();
        const imgTop = rect.top + scrollTop;
        const imgBottom = imgTop + rect.height;

        const isVisible =
          imgBottom >= scrollTop - 50 &&
          imgTop <= scrollTop + windowHeight + 50;

        if (isVisible) {
          loader.load().then((success) => {
            if (success) {
              this.images.delete(img);
            }
          });
        }
      });
    }

    /**
     * Refresh to detect new images
     */
    refresh() {
      this.collectImages();
      this.checkVisibleImages();
    }

    /**
     * Destroy the fallback lazy loader
     */
    destroy() {
      if (this.throttleTimeout) {
        clearTimeout(this.throttleTimeout);
      }
      this.images.clear();
      this.initialized = false;

      Logger.log('Fallback lazy loader destroyed');
    }
  }

  /**
   * Main lazy loading manager
   */
  class LazyLoadingManager {
    constructor(config = {}) {
      this.config = { ...CONFIG, ...config };
      this.loader = null;
    }

    /**
     * Initialize lazy loading with appropriate strategy
     */
    init() {
      try {
        if (this.supportsIntersectionObserver()) {
          this.loader = new IntersectionObserverLazyLoader(this.config);
          Logger.log('Using Intersection Observer strategy');
        } else {
          this.loader = new FallbackLazyLoader(this.config);
          Logger.log('Using fallback scroll strategy');
        }

        this.loader.init();
        this.attachDOMObserver();

        return this;
      } catch (error) {
        Logger.error('Failed to initialize lazy loading', error);
        return null;
      }
    }

    /**
     * Check if Intersection Observer is supported
     */
    supportsIntersectionObserver() {
      return (
        'IntersectionObserver' in window &&
        'IntersectionObserverEntry' in window &&
        'intersectionRatio' in window.IntersectionObserverEntry.prototype
      );
    }

    /**
     * Attach MutationObserver to detect dynamically added images
     */
    attachDOMObserver() {
      if (!('MutationObserver' in window)) {
        return;
      }

      const observer = new MutationObserver((mutations) => {
        let hasNewImages = false;

        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) {
                if (
                  node.matches &&
                  node.matches(this.config.imageSelector)
                ) {
                  hasNewImages = true;
                } else if (node.querySelectorAll) {
                  const images = node.querySelectorAll(this.config.imageSelector);
                  if (images.length > 0) {
                    hasNewImages = true;
                  }
                }
              }
            });
          }
        });

        if (hasNewImages && this.loader) {
          Logger.log('New images detected, refreshing lazy loader');
          this.loader.refresh();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    /**
     * Manually refresh lazy loading
     */
    refresh() {
      if (this.loader) {
        this.loader.refresh();
      }
    }

    /**
     * Destroy lazy loading
     */
    destroy() {
      if (this.loader) {
        this.loader.destroy();
        this.loader = null;
      }
    }
  }

  /**
   * Initialize lazy loading when DOM is ready
   */
  function initializeLazyLoading() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.lazyLoadingManager = new LazyLoadingManager().init();
      });
    } else {
      window.lazyLoadingManager = new LazyLoadingManager().init();
    }
  }

  initializeLazyLoading();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LazyLoadingManager, ImageLoader };
  }
})();