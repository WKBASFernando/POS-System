import {item_db, orders_db, payment_db, customer_db} from "../db/db.js";

/*-----------------Home Controller Initialization---------------------------*/
$(document).ready(function() {
    initializeHomePage();
    setupEventListeners();
    updateStatistics();
    setupScrollAnimations();
    setupNavigation();
});

/*-----------------Initialize Home Page---------------------------*/
function initializeHomePage() {
    // Add welcome animation
    setTimeout(() => {
        $('.animate__animated').each(function(index) {
            $(this).css('animation-delay', (index * 0.1) + 's');
        });
    }, 100);
    
    // Update page title
    updatePageTitle();
    
    // Initialize tooltips if needed
    if (typeof bootstrap !== 'undefined') {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

/*-----------------Setup Event Listeners---------------------------*/
function setupEventListeners() {
    // Quick action buttons
    $('#viewOrdersFromHome').on('click', function() {
        // Load and show orders modal
        if (typeof loadOrderHistory === 'function') {
            loadOrderHistory();
            $('#ordersModal').modal('show');
        } else {
            scrollToSection('order-section');
        }
    });
    
    // Statistics refresh
    $('#refreshStats').on('click', function() {
        updateStatistics();
        showNotification('Statistics updated!', 'success');
    });
    
    // Auto-refresh statistics every 30 seconds
    setInterval(updateStatistics, 30000);
    
    // Navigation link active state
    $('.nav-link').on('click', function() {
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
    });
}

/*-----------------Update Statistics---------------------------*/
function updateStatistics() {
    try {
        // Update total orders with animation
        const totalOrders = orders_db ? orders_db.length : 0;
        animateCounter('#totalOrders', totalOrders);
        
        // Update total customers with animation
        const totalCustomers = customer_db ? customer_db.length : 0;
        animateCounter('#totalCustomers', totalCustomers);
        
        // Update total items with animation
        const totalItems = item_db ? item_db.length : 0;
        animateCounter('#totalItems', totalItems);
        
        // Calculate and update total revenue
        const totalRevenue = calculateTotalRevenue();
        animateCounter('#totalRevenue', totalRevenue, true);
        
        // Update additional statistics
        updateDashboardMetrics();
        
    } catch (error) {
        console.error('Error updating statistics:', error);
        showNotification('Error updating statistics', 'error');
    }
}

/*-----------------Calculate Total Revenue---------------------------*/
function calculateTotalRevenue() {
    try {
        if (!payment_db || !Array.isArray(payment_db)) {
            return 0;
        }
        
        return payment_db.reduce((total, payment) => {
            const amount = parseFloat(payment.total) || 0;
            return total + amount;
        }, 0);
    } catch (error) {
        console.error('Error calculating revenue:', error);
        return 0;
    }
}

/*-----------------Animate Counter---------------------------*/
function animateCounter(selector, targetValue, isCurrency = false) {
    const element = $(selector);
    const currentValue = parseInt(element.text().replace(/[^0-9.]/g, '')) || 0;
    
    if (currentValue === targetValue) return;
    
    const increment = targetValue > currentValue ? 1 : -1;
    const stepTime = Math.abs(Math.floor(300 / Math.abs(targetValue - currentValue)));
    
    let current = currentValue;
    const timer = setInterval(() => {
        current += increment;
        
        if (isCurrency) {
            element.text('$' + current.toFixed(2));
        } else {
            element.text(current);
        }
        
        if (current === targetValue) {
            clearInterval(timer);
            // Add a small bounce animation
            element.addClass('animate__animated animate__pulse');
            setTimeout(() => {
                element.removeClass('animate__animated animate__pulse');
            }, 1000);
        }
    }, stepTime);
}

/*-----------------Update Dashboard Metrics---------------------------*/
function updateDashboardMetrics() {
    try {
        // Calculate today's orders
        const today = new Date().toISOString().split('T')[0];
        const todaysOrders = payment_db ? payment_db.filter(payment => 
            payment.date === today
        ).length : 0;
        
        // Calculate low stock items
        const lowStockItems = item_db ? item_db.filter(item => 
            parseInt(item.itemQty) < 10
        ).length : 0;
        
        // Update UI elements if they exist
        if ($('#todaysOrders').length) {
            $('#todaysOrders').text(todaysOrders);
        }
        
        if ($('#lowStockItems').length) {
            $('#lowStockItems').text(lowStockItems);
            
            // Show warning if low stock
            if (lowStockItems > 0) {
                $('#lowStockWarning').show();
            } else {
                $('#lowStockWarning').hide();
            }
        }
        
        // Calculate average order value
        if (orders_db && orders_db.length > 0) {
            const totalRevenue = calculateTotalRevenue();
            const averageOrder = totalRevenue / orders_db.length;
            
            if ($('#averageOrder').length) {
                $('#averageOrder').text('$' + averageOrder.toFixed(2));
            }
        }
        
    } catch (error) {
        console.error('Error updating dashboard metrics:', error);
    }
}

/*-----------------Smooth Scroll to Section---------------------------*/
function scrollToSection(sectionId) {
    const target = $('#' + sectionId);
    if (target.length) {
        const offsetTop = target.offset().top - 80; // Account for fixed navbar
        
        $('html, body').animate({
            scrollTop: offsetTop
        }, 800, 'swing');
        
        // Update active nav link
        $('.nav-link').removeClass('active');
        $(`a[href="#${sectionId}"]`).addClass('active');
    }
}

/*-----------------Setup Scroll Animations---------------------------*/
function setupScrollAnimations() {
    // Intersection Observer for scroll animations
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Add animation classes based on element type
                    if (element.classList.contains('stats-card')) {
                        element.classList.add('animate__animated', 'animate__fadeInUp');
                    } else if (element.classList.contains('feature-card')) {
                        element.classList.add('animate__animated', 'animate__fadeInUp');
                    }
                    
                    observer.unobserve(element);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe elements
        $('.stats-card, .feature-card').each(function() {
            observer.observe(this);
        });
    }
}

/*-----------------Setup Navigation---------------------------*/
function setupNavigation() {
    // Smooth scrolling for navigation links
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        
        if (target.length) {
            const targetSection = this.getAttribute('href').substring(1);
            scrollToSection(targetSection);
        }
    });
    
    // Update active navigation on scroll
    $(window).on('scroll', function() {
        updateActiveNavigation();
    });
}

/*-----------------Update Active Navigation---------------------------*/
function updateActiveNavigation() {
    try {
        const scrollPos = $(window).scrollTop() + 100;
        const sections = ['home-section', 'order-section', 'customer-section', 'item-section'];
        
        sections.forEach(sectionId => {
            const section = $('#' + sectionId);
            if (section.length) {
                const sectionTop = section.offset().top;
                const sectionBottom = sectionTop + section.outerHeight();
                
                if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                    $('.nav-link').removeClass('active');
                    $(`a[href="#${sectionId}"]`).addClass('active');
                }
            }
        });
    } catch (error) {
        console.error('Error updating navigation:', error);
    }
}

/*-----------------Update Page Title---------------------------*/
function updatePageTitle() {
    const currentHour = new Date().getHours();
    let greeting = 'Welcome';
    
    if (currentHour < 12) {
        greeting = 'Good Morning';
    } else if (currentHour < 17) {
        greeting = 'Good Afternoon';
    } else {
        greeting = 'Good Evening';
    }
    
    // Update title if element exists
    if ($('.hero-section h1').length) {
        const currentTitle = $('.hero-section h1').html();
        const newTitle = currentTitle.replace('Welcome to', `${greeting}! Welcome to`);
        $('.hero-section h1').html(newTitle);
    }
}

/*-----------------Show Notification---------------------------*/
function showNotification(message, type = 'info') {
    // Create toast notification
    const toastHtml = `
        <div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    // Add toast container if it doesn't exist
    if (!$('#toast-container').length) {
        $('body').append('<div id="toast-container" class="toast-container position-fixed top-0 end-0 p-3"></div>');
    }
    
    const $toast = $(toastHtml);
    $('#toast-container').append($toast);
    
    // Initialize and show toast
    if (typeof bootstrap !== 'undefined') {
        const toast = new bootstrap.Toast($toast[0]);
        toast.show();
        
        // Remove toast element after it's hidden
        $toast.on('hidden.bs.toast', function() {
            $(this).remove();
        });
    } else {
        // Fallback if Bootstrap JS is not available
        $toast.show();
        setTimeout(() => {
            $toast.fadeOut(() => $toast.remove());
        }, 5000);
    }
}

/*-----------------Get Recent Orders---------------------------*/
function getRecentOrders(limit = 5) {
    try {
        if (!orders_db || !Array.isArray(orders_db)) {
            return [];
        }
        
        // Get orders with payment information
        const recentOrders = orders_db
            .map(order => {
                const payment = payment_db ? payment_db.find(p => p.payId === order.payId) : null;
                const customer = customer_db ? customer_db.find(c => c.customerID === order.customer) : null;
                
                return {
                    ...order,
                    paymentInfo: payment,
                    customerInfo: customer
                };
            })
            .sort((a, b) => {
                // Sort by date (most recent first)
                if (a.paymentInfo && b.paymentInfo) {
                    const dateA = new Date(`${a.paymentInfo.date} ${a.paymentInfo.time}`);
                    const dateB = new Date(`${b.paymentInfo.date} ${b.paymentInfo.time}`);
                    return dateB - dateA;
                }
                return 0;
            })
            .slice(0, limit);
        
        return recentOrders;
    } catch (error) {
        console.error('Error getting recent orders:', error);
        return [];
    }
}

/*-----------------Get Low Stock Items---------------------------*/
function getLowStockItems(threshold = 10) {
    try {
        if (!item_db || !Array.isArray(item_db)) {
            return [];
        }
        
        return item_db.filter(item => {
            const quantity = parseInt(item.itemQty) || 0;
            return quantity < threshold;
        }).sort((a, b) => {
            return parseInt(a.itemQty) - parseInt(b.itemQty);
        });
    } catch (error) {
        console.error('Error getting low stock items:', error);
        return [];
    }
}

/*-----------------Format Currency---------------------------*/
function formatCurrency(amount) {
    try {
        const number = parseFloat(amount) || 0;
        return '$' + number.toFixed(2);
    } catch (error) {
        return '$0.00';
    }
}

/*-----------------Format Date---------------------------*/
function formatDate(dateString, timeString = '') {
    try {
        const date = new Date(dateString + (timeString ? ` ${timeString}` : ''));
        return date.toLocaleDateString() + (timeString ? ` ${timeString}` : '');
    } catch (error) {
        return dateString;
    }
}

/*-----------------Export Functions---------------------------*/
// Make functions available globally
window.scrollToSection = scrollToSection;
window.updateStatistics = updateStatistics;
window.showNotification = showNotification;

// Export for module usage
export {
    updateStatistics,
    scrollToSection,
    showNotification,
    getRecentOrders,
    getLowStockItems,
    formatCurrency,
    formatDate
};

$('#orderBtn').click(function () {
    $("section").not("#headerSection-container").hide();
    $("#order-section").show();
})

$('#customerBtn').click(function () {
    $("section").not("#headerSection-container").hide();
    $("#customer-section").show();
})