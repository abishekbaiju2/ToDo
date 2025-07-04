import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const toggleAuth = () => setIsLogin(!isLogin);

  const [message, setMessage] = useState('');

  const [isError, setIsError] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin
      ? 'http://127.0.0.1:8000/api/todo/login/'
      : 'http://127.0.0.1:8000/api/todo/register/';
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(url, formData);
      setIsError(false);

      if (isLogin) {
        localStorage.clear()
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        setTimeout(() => { navigate("/dashboard"); setLoading(false) });
      } else {
        navigate(`/emailverify?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData && typeof errorData === 'object') {
        const firstKey = Object.keys(errorData)[0];
        const firstError = Array.isArray(errorData[firstKey])
          ? errorData[firstKey][0]
          : errorData[firstKey];
        setMessage(firstError);
      } else {
        setMessage('An error occurred.');
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='container vh-100 d-flex justify-content-center align-items-center'>
  <div className="row w-100 shadow rounded-4 overflow-hidden" style={{ maxWidth: '900px'}}>
    
    {/* Left Section (heading) */}
    <div className="col-12 col-md-6 bg-primary text-white d-flex flex-column justify-content-center p-4 todo1">
      <h2 className="fw-bold text-center mb-2">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      <p className="text-center">
        {isLogin ? 'Sign in to manage your tasks' : 'Join us to get organized'}
      </p>
    </div>

    {/* Right Section (form) */}
    <div className="col-12 col-md-6 bg-white p-4">

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <div className="mb-3">
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                name="first_name"
                className="form-control"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                name="last_name"
                className="form-control"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        <div className="mb-3">
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="switch btn  text-white w-100"
          disabled={loading}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm" />
          ) : isLogin ? 'Sign In' : 'Register'}
        </button>

        {isLogin && (
          <div className="text-center mt-2">
            <a
              href={`/forgetpasswordotp?email=${encodeURIComponent(formData.email)}`}
              className="text-decoration-none"
            >
              Forgot password?
            </a>
          </div>
        )}
      </form>

      {message && (
        <div className="alert alert-danger text-center mt-3" role="alert">
          {message}
        </div>
      )}

      <p className="text-center text-muted mt-2 small ">
        By continuing, you agree to our{' '}
        <a href="https://policies.google.com/terms" className='text-decoration-none'>Terms</a> &{' '}
        <a href="https://policies.google.com/privacy" className='text-decoration-none'>Privacy</a>
      </p>

      <div className="text-center mt-4 fw-bold">
  <small
    onClick={toggleAuth}
    className="text-decoration-none link"
    role="button"
  >
    {isLogin
      ? "Don't have an account? Register here!"
      : "Already have an account? Sign in here!"}
  </small>
</div>
    </div>
  </div>
</div>
  )
}

export default AuthForm;
