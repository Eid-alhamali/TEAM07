import { useState, useEffect } from 'react'
import './LoginRegister.css'
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa"; // npm install react-icons
import validator from 'validator'; // npm install validator

const LoginRegister = () => {
    
    // state variables to manage form data, error messages, and action (login or register)
    const [action, setAction] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [termsChecked, setTermsChecked] = useState(false);
    const [termsError, setTermsError] = useState('');
    const [loginError, setLoginError] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        // Add the class to the body element
        document.body.classList.add('loginregister-body');

        // Cleanup function to remove the class when the component is unmounted
        return () => {
            document.body.classList.remove('loginregister-body');
        };
    }, []);

    // switch to register form
    const registerLink = () => {
        setAction(' alternate');
        clearFields();
    };

    // switch to login form
    const loginLink = () => {
        setAction('');
        clearFields();
    };

    // clear all input fields and error messages
    const clearFields = () => {
        setUsername('');
        setEmail('');
        setPassword('');
        setTermsChecked(false);
        setTermsError('');
        setLoginError('');
        setRegisterError('');
        setEmailError('');
        setPasswordError('');
    };

    // password validate function
    const validatePassword = (password) => {
        const isValid = validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        });
        return isValid;
    };
    
    // handle registration logic and perform validation checks
    const handleRegister = (e) => {
        e.preventDefault(); {/*remove later*/}

        if (!validator.isEmail(email)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }

        if (!validatePassword(password)) {
            setPasswordError('Weak Password');
        } else {
            setPasswordError('');
        }
        
        if (!username || !email || !password) {
            setRegisterError('Please fill out all fields');
        } else {
            setRegisterError('');
        }

        if (!termsChecked) {
            setTermsError('You must agree to the terms and conditions');
        } else {
            setTermsError('');
        }

        if (!username || !email || !password || !termsChecked || emailError || passwordError) {
            return;
        }

        alert('Registered successfully!');
        clearFields();
        loginLink();
    };

    // handle login logic and check for required fields
    const handleLogin = (e) => {
        e.preventDefault(); // remove later

        if (username && password) {
            setLoginError('');
            alert('Logged in successfully!');  
            clearFields();
        } else {
            setLoginError('Please fill out both fields');
        }
    };

    return (
    <div className="loginregister-page">
        <div className={`loginregister-wrapper${action}`}>
            {/*login form*/}
            <div className="loginregister-form-box login">
                <form action="" className="loginregister-form">
                    <h1>Login</h1>

                    <div className="loginregister-input-box">
                        <input type="text" 
                        placeholder='Username' 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required/>
                        <FaUser className='loginregister-icon' />
                    </div>

                    <div className="loginregister-input-box">
                        <input type="password" 
                        placeholder='Password' 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required/>
                        <FaLock className='loginregister-icon' />
                    </div>

                    <div className="loginregister-remember-forgot">
                        <label><input type="checkbox"/>
                        Remember Me</label>
                        <a href="#">Forgot Password</a>
                    </div>

                    <button type="submit" onClick={handleLogin}>Login</button>

                    {loginError && <div className="loginregister-error-message">{loginError}</div>}
                    
                    <div className="loginregister-register-link">
                        <p>Don&apos;t have an account?
                            <a href="#" onClick={registerLink}>Register</a>
                        </p>
                    </div>
                </form>
            </div>
            
            {/*register form*/}
            <div className="loginregister-form-box register">
                <form action="" className="loginregister-form">
                    <h1>Register</h1>

                    <div className="loginregister-input-box">
                        <input type="text" 
                        placeholder='Username' 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required/>
                        <FaUser className='loginregister-icon' />
                    </div>

                    <div className="loginregister-input-box">
                        <input type="email" 
                        placeholder='E-Mail'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required/>
                        <FaEnvelope className='loginregister-icon' />
                    </div>
                    {emailError && <div className="loginregister-error-message">{emailError}</div>}

                    <div className="loginregister-input-box">
                        <input type="password" 
                        placeholder='Password' 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required/>
                        <FaLock className='loginregister-icon' />
                    </div>
                    {passwordError && <div className="loginregister-error-message">{passwordError}</div>}

                    <div className="loginregister-remember-forgot">
                        <label><input type="checkbox"
                        checked={termsChecked}
                        onChange={() => setTermsChecked(!termsChecked)}/>
                        I agree to the terms & conditions</label>
                    </div>

                    {termsError && <div className="loginregister-error-message">{termsError}</div>}

                    <button type="submit" onClick={handleRegister}>Register</button>

                    {registerError && <div className="loginregister-error-message">{registerError}</div>}

                    <div className="loginregister-register-link">
                        <p>Already have an account? 
                            <a href="#" onClick={loginLink}>Login</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>
    )
}

export default LoginRegister