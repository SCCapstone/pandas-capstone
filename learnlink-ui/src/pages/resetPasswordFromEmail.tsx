import Logo from '../components/Logo';
import CopyrightFooter from '../components/CopyrightFooter';
import { useNavigate, useParams } from 'react-router-dom';
import React, { useState } from 'react';

const ResetPasswordFromEmail: React.FC = () => {

    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

  
    const handleResetPassword = async () => {
      const response = await fetch(`${REACT_APP_API_URL}/api/reset-password/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert("Password reset successful!");
        navigate("/login");
      } else {
        setError(data.error || "Something went wrong");
      }
    };
  
    return (
        <div className="resetPassword">
            <Logo />
            {/* <form>
            <label>New Password</label>
            <input type="password"></input>

            <label>Confirm New Password</label>
            <input type="password"></input>

            <button type="submit"></button>

        </form> */}
            <div>{error && <p style={{ color: "red" }}>{error}</p>}
                <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleResetPassword}>Reset Password</button>
            </div>
            <CopyrightFooter />
        </div>

    );
}

export default ResetPasswordFromEmail;