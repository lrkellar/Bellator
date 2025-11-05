// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Notification functions
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const notificationContent = notification.querySelector('.notification-content');

    notificationMessage.textContent = message;
    notificationContent.className = `notification-content ${type}`;
    notification.classList.add('show');
}

function hideNotification() {
    const notification = document.getElementById('notification');
    notification.classList.remove('show');
}

// Close notification when clicking the X or outside
document.addEventListener('DOMContentLoaded', () => {
    const notification = document.getElementById('notification');
    const closeBtn = document.getElementById('notification-close');

    closeBtn.addEventListener('click', hideNotification);

    notification.addEventListener('click', (e) => {
        if (e.target === notification) {
            hideNotification();
        }
    });
});

// Contact form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');

        // Simple validation
        if (!name || !email || !subject || !message) {
            showNotification('Please fill in all fields.', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            // Submit to Formspree
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                showNotification('Thank you! Your message has been sent successfully. We will get back to you soon.', 'success');
                this.reset();
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification('Sorry, there was an error sending your message. Please try again or contact us directly at ritterstandalpha@gmail.com.', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.service-card, .portfolio-item, .stat');

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Counter animation for stats
function animateCounter(element, target, suffix = '', duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + suffix;
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + suffix;
        }
    }

    updateCounter();
}

// Animate stats when they come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statElement = entry.target.querySelector('h4');
            const text = statElement.textContent;

            // Extract number and suffix from text like "$50M+" or "15+" or "11%+"
            const match = text.match(/(\d+)(.*)$/);
            if (match) {
                const number = parseInt(match[1]);
                const suffix = match[2]; // This will be "%+" for the percentage stat
                statElement.textContent = '0' + suffix;
                animateCounter(statElement, number, suffix);
            }

            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.stat').forEach(stat => {
        statsObserver.observe(stat);
    });
});

// Active section detection
function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const navMenu = document.querySelector('.nav-menu');

    let currentSection = '';
    const scrollPosition = window.scrollY + 100; // Offset for navbar height

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    // Update active nav link
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${currentSection}`) {
            link.classList.add('active');

            // Calculate position for background highlight
            const linkRect = link.getBoundingClientRect();
            const menuRect = navMenu.getBoundingClientRect();
            const relativeLeft = linkRect.left - menuRect.left;
            const linkWidth = linkRect.width;

            navMenu.classList.add('active-section');
            navMenu.style.setProperty('--active-left', `${relativeLeft}px`);
            navMenu.style.setProperty('--active-width', `${linkWidth}px`);
        }
    });

    // If no section is active, remove the background
    if (!currentSection) {
        navMenu.classList.remove('active-section');
    }
}

// Throttled scroll handler for better performance
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(updateActiveNavigation, 10);
});

// Initial call
document.addEventListener('DOMContentLoaded', updateActiveNavigation);

// Update on resize to recalculate positions
window.addEventListener('resize', updateActiveNavigation);

// Properties Management
class PropertiesManager {
    constructor() {
        // PROPERTIES_DATA_START - Do not modify this line
        this.properties = [
            {
                name: "3696 Leonard Springs",
                address: "3696 S Leonard Springs, Bloomington, IN 47403",
                folder: "3696LeonardSprings",
                improvements: [
                    "Complete Kitchen Renovation",
                    "Bathroom Modernization",
                    "Flooring Upgrades",
                    "Fresh Paint Throughout",
                    "Updated Fixtures & Hardware",
                    "Landscaping Improvements"
                ],
                images: {
                    original: [
                        "BathroomMay2024.JPG",
                        "bedroomMay2024.JPG",
                        "kitchen2May2024.JPG",
                        "kitchenMay2024.jpg",
                        "LaundryRoomMay2024.JPG",
                        "LivingRoomMay2024.JPG"
                    ],
                    remodel: [
                        "20250811_193607.jpg",
                        "20250811_193717.jpg",
                        "20250811_194636.jpg",
                        "20250811_194639.jpg"
                    ]
                },
                folders: {
                    original: "original",
                    remodel: "Remodel"
                }
            }
        ];
        // PROPERTIES_DATA_END - Do not modify this line

        console.log('✅ Using hardcoded properties data:', this.properties);
        this.init();
    }

    init() {
        this.loadProperties();
        this.setupImageModal();
    }

    async loadProperties() {
        const container = document.getElementById('properties-container');
        if (!container) {
            console.error('Properties container not found');
            return;
        }

        console.log('Loading properties...');
        for (const property of this.properties) {
            console.log(`Creating showcase for: ${property.name}`);
            const propertyElement = await this.createPropertyShowcase(property);
            container.appendChild(propertyElement);
        }
        console.log('Properties loaded successfully');
    }

    async createPropertyShowcase(property) {
        const showcase = document.createElement('div');
        showcase.className = 'property-showcase';

        // Use specified images if available, otherwise try auto-detection
        const originalFolder = property.folders?.original || 'original';
        const remodelFolder = property.folders?.remodel || 'remodel';

        const originalImages = property.images?.original?.length > 0 ?
            property.images.original.map(img => {
                const path = `media/properties/${property.folder}/${originalFolder}/${img}`;
                console.log(`Original image path: ${path}`);
                return path;
            }) :
            await this.getImages(property.folder, originalFolder);

        const remodelImages = property.images?.remodel?.length > 0 ?
            property.images.remodel.map(img => {
                const path = `media/properties/${property.folder}/${remodelFolder}/${img}`;
                console.log(`Remodel image path: ${path}`);
                return path;
            }) :
            await this.getImages(property.folder, remodelFolder);

        console.log(`Found ${originalImages.length} original images and ${remodelImages.length} remodel images`);
        const propertyId = 'property-' + property.folder.toLowerCase().replace(/\s+/g, '-');

        showcase.innerHTML = `
            <div class="property-header">
                <h3>${property.name}</h3>
                <p class="property-address">${property.address}</p>
            </div>
            
            <div class="property-tabs">
                <div class="tab-buttons">
                    <button class="tab-button before" onclick="switchTab('${propertyId}', 'before')">
                        Before Renovation
                    </button>
                    <button class="tab-button after active" onclick="switchTab('${propertyId}', 'after')">
                        After Renovation
                    </button>
                </div>
                
                <div id="${propertyId}-before" class="tab-content">
                    <div class="image-gallery">
                        ${originalImages.length > 0 ?
                originalImages.map(img => `
                                <img src="${img}" alt="Before renovation" class="property-image" onclick="openImageModal('${img}')" 
                                     onerror="console.error('Failed to load image: ${img}'); this.style.border='2px solid red';"
                                     onload="console.log('Successfully loaded: ${img}')">
                            `).join('') :
                '<p style="text-align: center; color: var(--gray-500); padding: 2rem;">No before images available</p>'
            }
                    </div>
                </div>
                
                <div id="${propertyId}-after" class="tab-content active">
                    <div class="image-gallery">
                        ${remodelImages.length > 0 ?
                remodelImages.map(img => `
                                <img src="${img}" alt="After renovation" class="property-image" onclick="openImageModal('${img}')" 
                                     onerror="console.error('Failed to load image: ${img}'); this.style.border='2px solid red';"
                                     onload="console.log('Successfully loaded: ${img}')">
                            `).join('') :
                '<p style="text-align: center; color: var(--gray-500); padding: 2rem;">No after images available</p>'
            }
                    </div>
                </div>
            </div>
            
            <div class="improvements-summary">
                <h4>Key Improvements</h4>
                <ul class="improvements-list">
                    ${property.improvements.map(improvement => `
                        <li>${improvement}</li>
                    `).join('')}
                </ul>
            </div>
        `;

        return showcase;
    }

    async getImages(propertyFolder, subfolder) {
        // Common image extensions
        const extensions = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP'];
        const images = [];

        // Expanded list of possible image names including panorama-style names
        const commonNames = [
            // Numbers
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
            // Room types
            'main', 'kitchen', 'bathroom', 'living', 'bedroom', 'dining', 'hallway', 'exterior',
            // Panorama style names
            'panorama', 'pano', 'wide', 'full', 'overview', 'room',
            // Common photo names
            'photo', 'image', 'pic', 'shot',
            // Before/after specific
            'before', 'after', 'original', 'remodel', 'renovation',
            // Generic names
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
            // Date-like patterns (common in phone photos)
            'IMG_0001', 'IMG_0002', 'IMG_0003', 'IMG_0004', 'IMG_0005',
            'DSC_0001', 'DSC_0002', 'DSC_0003', 'DSC_0004', 'DSC_0005',
            // Empty string for files without prefix
            ''
        ];

        console.log(`Looking for images in: media/properties/${propertyFolder}/${subfolder}/`);

        for (const name of commonNames) {
            for (const ext of extensions) {
                const imagePath = name ?
                    `media/properties/${propertyFolder}/${subfolder}/${name}.${ext}` :
                    `media/properties/${propertyFolder}/${subfolder}/.${ext}`;

                if (await this.imageExists(imagePath)) {
                    console.log(`Found image: ${imagePath}`);
                    images.push(imagePath);
                }
            }
        }

        console.log(`Total images found in ${subfolder}:`, images.length);
        return images;
    }

    async imageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

    setupImageModal() {
        // Create modal HTML
        const modal = document.createElement('div');
        modal.id = 'image-modal';
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="closeImageModal()">&times;</button>
                <img id="modal-image" class="modal-image" src="" alt="">
            </div>
        `;
        document.body.appendChild(modal);

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeImageModal();
            }
        });
    }
}

// Global functions for image modal
function openImageModal(imageSrc) {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    modalImage.src = imageSrc;
    modal.classList.add('show');
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    modal.classList.remove('show');
}

// Tab switching functionality
function switchTab(propertyId, tabType) {
    // Get all tab buttons and contents for this property
    const propertyElement = document.querySelector(`#${propertyId}-before`).closest('.property-showcase');
    const tabButtons = propertyElement.querySelectorAll('.tab-button');
    const tabContents = propertyElement.querySelectorAll('.tab-content');

    // Remove active class from all tabs
    tabButtons.forEach(button => button.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Add active class to selected tab
    const activeButton = propertyElement.querySelector(`.tab-button.${tabType}`);
    const activeContent = propertyElement.querySelector(`#${propertyId}-${tabType}`);

    if (activeButton && activeContent) {
        activeButton.classList.add('active');
        activeContent.classList.add('active');
    }
}

// Initialize properties when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PropertiesManager();
});