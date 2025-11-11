// Simple in-browser user store (demo): stores registered users in localStorage under 'ce_users'
        // Structure: [{email, password, fullname, role, extra:{studentId, course} or extra:{department}}]

        let currentRole = 'user';
        let currentView = 'login';

        // Ensure demo admin exists (only for convenience)
        function ensureDemoAdmin() {
            const users = getUsers();
            const exists = users.some(u => u.role === 'admin' && u.email === 'admin@bmsce.edu');
            if (!exists) {
                users.push({
                    email: 'admin@bmsce.edu',
                    password: 'Admin@123',
                    fullname: 'Demo Admin',
                    role: 'admin',
                    extra: { department: 'Student Affairs' }
                });
                saveUsers(users);
            }
        }

        function getUsers() {
            try { return JSON.parse(localStorage.getItem('ce_users') || '[]'); } catch (e) { return []; }
        }
        function saveUsers(users) { localStorage.setItem('ce_users', JSON.stringify(users)); }

        function setRole(role) {
            currentRole = role;
            document.getElementById('role-user').classList.toggle('active', role === 'user');
            document.getElementById('role-admin').classList.toggle('active', role === 'admin');
            const roleTitle = document.getElementById('role-title');
            const pageTitle = document.getElementById('page-title');
            const pageDesc = document.getElementById('page-desc');
            if (role === 'admin') {
                roleTitle.innerHTML = '<span class="role-badge admin-badge">Admin</span>';
                if (currentView === 'login') {
                    pageTitle.textContent = 'Admin Login';
                    pageDesc.textContent = 'Administrative access — use your admin credentials.';
                } else {
                    pageTitle.textContent = 'Admin Registration';
                    pageDesc.textContent = 'Create admin access (requires verification).';
                }
            } else {
                roleTitle.innerHTML = '<span class="role-badge user-badge">User</span>';
                if (currentView === 'login') {
                    pageTitle.textContent = 'User Login';
                    pageDesc.textContent = 'Sign in to register for events and view your tickets.';
                } else {
                    pageTitle.textContent = 'User Registration';
                    pageDesc.textContent = 'Create a student account to join events.';
                }
            }
            renderExtraField();
        }

        function showView(view) {
            currentView = view;
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(view).classList.add('active');
            setRole(currentRole);
        }

        function renderExtraField() {
            const container = document.getElementById('extra-field');
            container.innerHTML = '';
            if (currentView === 'register') {
                if (currentRole === 'admin') {
                    container.innerHTML = `
            <label for="admin-code">Admin Code (verification)</label>
            <input type="text" id="admin-code" name="admin-code" placeholder="Enter admin code" required />

            <label for="department">Department</label>
            <input type="text" id="department" name="department" placeholder="Event Management / Student Affairs" />
          `;
                } else {
                    container.innerHTML = `
            <label for="student-id">Student ID</label>
            <input type="text" id="student-id" name="student-id" placeholder="20XXCS123" required />

            <label for="course">Course / Year</label>
            <input type="text" id="course" name="course" placeholder="B.E. CS - 3rd Year" />
          `;
                }
            }
        }

        function switchRole() { setRole(currentRole === 'user' ? 'admin' : 'user'); }

        function handleLogin(e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim().toLowerCase();
            const pwd = document.getElementById('password').value;
            const msg = document.getElementById('login-msg');
            msg.textContent = '';

            const users = getUsers();
            const found = users.find(u => u.email.toLowerCase() === email && u.role === currentRole);
            if (!found || found.password !== pwd) {
                msg.innerHTML = '<div class="error">Invalid email or password — make sure you have registered under the selected role.</div>';
                return;
            }

            msg.innerHTML = '<div class="success">Signed in successfully as ' + currentRole.toUpperCase() + '. Redirecting to dashboard...</div>';
            // Demo redirect placeholder
            setTimeout(() => {
                // replace with actual dashboard URL
                window.location.href = currentRole === 'admin' ? '/btn/home.html' : '/btn/home.html';
            }, 700);
        }

        function handleRegister(e) {
            e.preventDefault();
            const msg = document.getElementById('register-msg');
            msg.textContent = '';

            const fullname = document.getElementById('fullname')?.value?.trim();
            const email = document.getElementById('reg-email')?.value?.trim().toLowerCase();
            const password = document.getElementById('reg-password')?.value;

            if (!fullname || !email || !password) {
                msg.innerHTML = '<div class="error">Please complete all required fields.</div>';
                return;
            }

            const users = getUsers();
            const exists = users.some(u => u.email.toLowerCase() === email && u.role === currentRole);
            if (exists) {
                msg.innerHTML = '<div class="error">An account with this email already exists for the selected role.</div>';
                return;
            }

            if (currentRole === 'admin') {
                const code = document.getElementById('admin-code')?.value?.trim();
                const correctCode = 'BMSCE1946';
                if (code !== correctCode) {
                    msg.innerHTML = '<div class="error">Invalid Admin Code. Access denied.</div>';
                    return;
                }
                const department = document.getElementById('department')?.value?.trim() || '';
                users.push({ email, password, fullname, role: 'admin', extra: { department } });
            } else {
                const sid = document.getElementById('student-id')?.value?.trim();
                if (!sid) {
                    msg.innerHTML = '<div class="error">Student ID is required.</div>';
                    return;
                }
                const course = document.getElementById('course')?.value?.trim() || '';
                users.push({ email, password, fullname, role: 'user', extra: { studentId: sid, course } });
            }

            saveUsers(users);
            msg.innerHTML = '<div class="success">Account created Successfully. You can now login with this email and password.</div>';
            // auto-switch to login after register
            setTimeout(() => { showView('login'); }, 800);
        }

        // init
        ensureDemoAdmin();
        setRole('user');
        renderExtraField();