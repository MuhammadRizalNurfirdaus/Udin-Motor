import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
            fetch('http://localhost:4000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(user => {
                    localStorage.setItem('user', JSON.stringify(user));

                    // Redirect based on role
                    switch (role || user.role) {
                        case 'OWNER':
                            navigate('/owner');
                            break;
                        case 'CASHIER':
                            navigate('/cashier');
                            break;
                        case 'DRIVER':
                            navigate('/driver');
                            break;
                        default:
                            navigate('/');
                    }
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
