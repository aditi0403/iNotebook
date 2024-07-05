import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = (props) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: credentials.email, password: credentials.password })
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || `Error: ${response.status}`);
      }

      if (json.success) {
        // Save the auth token and redirect
        localStorage.setItem('token', json.authtoken);
        navigate("/");
        props.showAlert("User Logged in!", "success");
      } else {
        props.showAlert(json.error || "Invalid Details", "danger");
      }
    } catch (error) {
      console.error('Error:', error);
      props.showAlert(error.message, "danger");
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  }

  return (
    <div className='mt-3'>
      <h2>Login to get into iNotebook!</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email1" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={credentials.email}
            onChange={onChange}
            id="email1"
            name="email"
            aria-describedby="emailHelp"
          />
          <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={credentials.password}
            onChange={onChange}
            name="password"
            id="password"
          />
        </div>
        <button type="submit" className="btn btn-secondary">Submit</button>
      </form>
    </div>
  );
}

export default Login;
