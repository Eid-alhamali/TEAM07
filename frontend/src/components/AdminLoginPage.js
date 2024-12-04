import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import anime from 'animejs';
import './AdminLoginPage.css';
import axios from 'axios';

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    let current = null;

    useEffect(() => {
        document.body.classList.add('adminlogin-body');
        return () => {
            document.body.classList.remove('adminlogin-body');
        };
    }, []);

    const handleFocus = (offset, dashArray) => {
        if (current) current.pause();
        current = anime({
            targets: 'path',
            strokeDashoffset: {
                value: offset,
                duration: 700,
                easing: 'easeOutQuart',
            },
            strokeDasharray: {
                value: dashArray,
                duration: 700,
                easing: 'easeOutQuart',
            },
        });
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post('/api/admin/login', { email, password });
            if (response.status === 200) {
                setLoginError('');
                alert('Welcome, Admin!');
                navigate('/admin/dashboard'); // Navigate to the dashboard on success
            }
        } catch (error) {
            setLoginError(error.response?.data?.message || 'Invalid email or password');
        }
    };
    

    return (
        <div className="admin-login-page">
            <div className="container">
                <div className="left">
                    <div className="login">Login</div>
                    <div className="eula">Welcome admin.</div>
                </div>
                <div className="right">
                    <svg viewBox="0 0 320 300">
                        <defs>
                            <linearGradient id="linearGradient" x1="13" y1="193.5" x2="307" y2="193.5" gradientUnits="userSpaceOnUse">
                                <stop style={{ stopColor: '#ff00ff' }} offset="0" />
                                <stop style={{ stopColor: '#ff0000' }} offset="1" />
                            </linearGradient>
                        </defs>
                        <path d="m 40,120.00016 239.99984,-3.2e-4 ..." />
                    </svg>
                    <div className="form">
                        <form onSubmit={handleAdminLogin}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => handleFocus(0, '240 1386')}
                                required
                            />
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => handleFocus(-336, '240 1386')}
                                required
                            />
                            <input
                                type="submit"
                                id="submit"
                                value="Submit"
                                onFocus={() => handleFocus(-730, '530 1386')}
                            />
                            {loginError && <div className="adminlogin-error">{loginError}</div>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;