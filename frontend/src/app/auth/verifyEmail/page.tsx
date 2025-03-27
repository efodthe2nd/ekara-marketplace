// VerifyEmail.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('Verifying your email...');
    const navigate = useNavigate();
    
    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');
            
            if (!token) {
                setStatus('Invalid verification link');
                return;
            }
            
            try {
                const response = await fetch(`/api/users/verify-email?token=${token}`);
                const data = await response.json();
                
                if (response.ok) {
                    setStatus('Email verified successfully! Redirecting to login...');
                    setTimeout(() => navigate('/login'), 3000);
                } else {
                    setStatus(`Verification failed: ${data.message}`);
                }
            } catch {
                setStatus('Error verifying email. Please try again.');
            }
        };
        
        verifyEmail();
    }, [searchParams, navigate]);
    
    return (
        <div>
            <h1>Email Verification</h1>
            <p>{status}</p>
        </div>
    );
};

export default VerifyEmail;