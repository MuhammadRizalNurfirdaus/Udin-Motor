import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../../services/api';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const role = searchParams.get('role');
        const error = searchParams.get('error');

        if (error) {
            navigate('/login?error=auth_failed');
            return;
        }

        if (token) {
            localStorage.setItem('token', token);

            // Fetch user data and redirect
            fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(user => {
                    localStorage.setItem('user', JSON.stringify(user));

                    // Use window.location to force full page reload so AuthContext picks up the new token
                    let redirectPath = '/';
                    switch (role || user.role) {
                        case 'OWNER':
                            redirectPath = '/owner';
                            break;
                        case 'CASHIER':
                            redirectPath = '/cashier';
                            break;
                        case 'DRIVER':
                            redirectPath = '/driver';
                            break;
                        default:
                            redirectPath = '/';
                    }
                    window.location.href = redirectPath;
                })
                .catch(() => {
                    navigate('/login?error=auth_failed');
                });
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div className="auth-container">
            <div className="loading">
                <div className="spinner"></div>
                <p style={{ marginTop: '20px' }}>Memproses login...</p>
            </div>
        </div>
    );
}
