// Notification System JavaScript
class NotificationSystem {
    constructor() {
        this.bell = document.getElementById('notificationBell');
        this.dropdown = document.getElementById('notificationDropdown');
        this.badge = document.getElementById('notificationBadge');
        this.list = document.getElementById('notificationList');
        this.markAllReadBtn = document.getElementById('markAllRead');
        
        this.isOpen = false;
        this.notifications = [];
        this.unreadCount = 0;
        
        this.init();
    }
    
    init() {
        if (!this.bell || !this.dropdown) return;
        
        // Event listeners
        this.bell.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        this.markAllReadBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.markAllAsRead();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.dropdown.contains(e.target) && !this.bell.contains(e.target)) {
                this.closeDropdown();
            }
        });
        
        // Load notifications on page load
        this.loadNotifications();
        
        // Auto-refresh notifications every 30 seconds
        setInterval(() => {
            this.loadNotifications();
        }, 30000);
    }
    
    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    openDropdown() {
        this.isOpen = true;
        this.dropdown.classList.add('show');
        this.loadNotifications();
    }
    
    closeDropdown() {
        this.isOpen = false;
        this.dropdown.classList.remove('show');
    }
    
    async loadNotifications() {
        try {
            const response = await fetch('get_notifications.php', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load notifications');
            }
            
            const data = await response.json();
            this.notifications = data.notifications || [];
            this.unreadCount = data.unread_count || 0;
            
            this.updateBadge();
            this.renderNotifications();
            
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.showError('Không thể tải thông báo');
        }
    }
    
    updateBadge() {
        if (this.unreadCount > 0) {
            this.badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
            this.badge.style.display = 'flex';
        } else {
            this.badge.style.display = 'none';
        }
    }
    
    renderNotifications() {
        if (!this.list) return;
        
        if (this.notifications.length === 0) {
            this.list.innerHTML = `
                <div class="notification-empty">
                    <div class="notification-empty-icon">🔔</div>
                    <p class="notification-empty-text">Chưa có thông báo nào</p>
                </div>
            `;
            return;
        }
        
        const notificationsHtml = this.notifications.map(notification => {
            const timeAgo = this.getTimeAgo(notification.created_at);
            const unreadClass = notification.is_read ? '' : 'unread';
            
            return `
                <div class="notification-item ${unreadClass}" data-id="${notification.id}" data-read="${notification.is_read}">
                    <div class="notification-item-content">
                        <h4 class="notification-title">${this.escapeHtml(notification.title)}</h4>
                        <p class="notification-message">${this.escapeHtml(notification.message)}</p>
                        <div class="notification-meta">
                            <span class="notification-time">${timeAgo}</span>
                            <span class="notification-type ${notification.type}">${notification.type}</span>
                        </div>
                        ${notification.action_url && notification.action_text ? `
                            <div class="notification-action">
                                <a href="${notification.action_url}">${notification.action_text}</a>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        this.list.innerHTML = notificationsHtml;
        
        // Add click listeners to notification items
        this.list.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const notificationId = item.dataset.id;
                const isRead = item.dataset.read === 'true';
                
                if (!isRead) {
                    this.markAsRead(notificationId);
                    item.classList.remove('unread');
                    item.dataset.read = 'true';
                    this.unreadCount = Math.max(0, this.unreadCount - 1);
                    this.updateBadge();
                }
                
                // If notification has action URL, navigate to it
                const actionLink = item.querySelector('.notification-action a');
                if (actionLink && !e.target.closest('.notification-action')) {
                    window.location.href = actionLink.href;
                }
            });
        });
    }
    
    async markAsRead(notificationId) {
        try {
            await fetch('mark_notification_read.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notification_id: notificationId })
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }
    
    async markAllAsRead() {
        try {
            const response = await fetch('mark_all_notifications_read.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                this.unreadCount = 0;
                this.updateBadge();
                this.renderNotifications();
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }
    
    getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Vừa xong';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} phút trước`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} giờ trước`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ngày trước`;
        } else {
            return date.toLocaleDateString('vi-VN');
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showError(message) {
        if (this.list) {
            this.list.innerHTML = `
                <div class="notification-empty">
                    <div class="notification-empty-icon">⚠️</div>
                    <p class="notification-empty-text">${message}</p>
                </div>
            `;
        }
    }
    
    // Public method to add new notification (for real-time updates)
    addNotification(notification) {
        this.notifications.unshift(notification);
        if (!notification.is_read) {
            this.unreadCount++;
        }
        this.updateBadge();
        if (this.isOpen) {
            this.renderNotifications();
        }
    }
}

// Initialize notification system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NotificationSystem();
});
