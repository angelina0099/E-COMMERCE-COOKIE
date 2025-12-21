const auth = {
    users: [
        { email: 'admin@app.com', password: 'admin123', role: 'admin', name: 'Admin User' },
        { email: 'user@app.com', password: 'user123', role: 'user', name: 'Regular User' }
    ],
    
    init() {
        const currentUser = this.getCurrentUser();
        if (!currentUser && window.location.hash !== '#login') {
            this.showLoginPage();
        }
    },
    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            const session = {
                email: user.email,
                role: user.role,
                name: user.name,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem('session', JSON.stringify(session));
            return { success: true, user: session };
        }
        return { success: false, error: i18n.t('invalidCredentials') };
    },
    logout() {
        localStorage.removeItem('session');
        window.location.hash = '#login';
        location.reload();
    },
    getCurrentUser() {
        const session = localStorage.getItem('session');
        if (session) {
            try {
                return JSON.parse(session);
            } catch (e) {
                return null;
            }
        }
        return null;
    },
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },
    showLoginPage() {
        document.getElementById('mainNav').classList.add('hidden');
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="min-h-screen flex items-center justify-center">
                <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    <div class="text-center mb-8">
                        <i class="fas fa-microchip text-5xl text-blue-600 mb-4"></i>
                        <h2 class="text-3xl font-bold text-gray-800" data-i18n="appTitle">COOKIE</h2>
                        <p class="text-gray-600 mt-2" data-i18n="login">Connexion</p>
                    </div> 
                    <form id="loginForm" class="space-y-6">
                        <div class="form-group">
                            <label class="form-label" data-i18n="email">Email</label>
                            <input type="email" id="loginEmail" class="form-input" required 
                                   placeholder="admin@app.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="password">Mot de passe</label>
                            <input type="password" id="loginPassword" class="form-input" required>
                        </div>
                        <div id="loginError" class="form-error hidden"></div>
                        <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold" data-i18n="loginButton">
                            Se connecter
                        </button>
                    </form>
                    <div class="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
                        <p class="font-semibold mb-2">Default Accounts:</p>
                        <p><strong>Admin:</strong> admin@app.com / admin123</p>
                        <p><strong>User:</strong> user@app.com / user123</p>
                    </div>
                </div>
            </div>
        `;
        i18n.updatePage();
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    },
    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');
        const result = this.login(email, password);
        if (result.success) {
            window.location.hash = '#dashboard';
            location.reload();
        } else {
            errorDiv.textContent = result.error;
            errorDiv.classList.remove('hidden');
        }
    }
};
