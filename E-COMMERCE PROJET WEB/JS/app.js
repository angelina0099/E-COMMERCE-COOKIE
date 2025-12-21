const app = {
    currentRoute: 'dashboard',
    async init() {
        await api.init();
        auth.init();
        if (!auth.isAuthenticated()) {
            auth.showLoginPage();
            return;
        }
        document.getElementById('mainNav').classList.remove('hidden');
        const currentUser = auth.getCurrentUser();
        document.getElementById('userDisplay').textContent = currentUser.name;
        document.getElementById('logoutBtn').addEventListener('click', () => {
            auth.logout();
        });
        this.setupRouting();
        this.loadRoute();
        i18n.init();
    },
    setupRouting() {
        window.addEventListener('hashchange', () => {
            this.loadRoute();
        });
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const route = link.getAttribute('href').substring(1);
                this.navigate(route);
            });
        });
    },
    navigate(route) {
        window.location.hash = `#${route}`;
    },
    loadRoute() {
        let route = window.location.hash.substring(1) || 'dashboard';
        if (route === 'login') {
            if (auth.isAuthenticated()) {
                route = 'dashboard';
                window.location.hash = '#dashboard';
            } else {
                auth.showLoginPage();
                return;
            }
        }
        if (!auth.isAuthenticated()) {
            auth.showLoginPage();
            return;
        }
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${route}`) {
                link.classList.add('active');
            }
        });
        this.currentRoute = route;
        this.renderPage(route);
    },
    
    renderPage(route) {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = '<div class="flex justify-center items-center h-64">' + utils.showLoading() + '</div>';
        setTimeout(() => {
            switch (route) {
                case 'dashboard':
                    dashboard.render();
                    break;
                case 'products':
                    products.render();
                    break;
                case 'categories':
                    categories.render();
                    break;
                case 'orders':
                    orders.render();
                    break;
                case 'suppliers':
                    suppliers.render();
                    break;
                case 'customers':
                    customers.render();
                    break;
                default:
                    this.render404();
            }
        }, 300);
    },
    
    render404() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="flex flex-col items-center justify-center h-96">
                <i class="fas fa-exclamation-triangle text-6xl text-yellow-500 mb-4"></i>
                <h2 class="text-3xl font-bold text-gray-800 mb-2">404 - Page Not Found</h2>
                <p class="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                <button onclick="app.navigate('dashboard')" 
                        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                    Go to Dashboard
                </button>
            </div>
        `;
    }
};
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}
