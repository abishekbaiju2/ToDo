import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

function Passwordreset() {

    const [formData, setformData] = useState({
        "email": "",
        "otp": "",
        "new_password": ""
    })

    const [message, setMessage] = useState('')

    const [loading, setLoading] = useState(false)

    const location = useLocation()

    const navigate = useNavigate()

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const email = params.get("email");
        if (email) {
            setformData(prev => ({ ...prev, email: email }));
        }
    }, [location.search]);

    const handlechange = (e) => {
        setformData({ ...formData, [e.target.name]: e.target.value })
    }

    async function handlesubmit(event) {
        event.preventDefault()
        if (loading) return
        setLoading(true)
        try {
            let response = await axios.post("http://127.0.0.1:8000/api/todo/resetpassword/", formData)
            navigate(`/?email=${encodeURIComponent(formData.email)}`)
        }
        catch (error) {
            const errormsg = error.response?.data?.error || "User not found.";
            setMessage(errormsg)
        }
        finally {
            setLoading(false)
        }
    }

    return (

        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 rounded-4 border p-4 p-sm-5 shadow bg-white">
                <h2 className="text-center mb-4 fw-bold fs-5">Enter your new password</h2>

                <form onSubmit={handlesubmit}>
                    <div className="mb-3">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handlechange}
                            className="form-control"
                            placeholder="Email"
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            type="text"
                            maxLength="4"
                            name="otp"
                            value={formData.otp}
                            onChange={handlechange}
                            className="form-control"
                            placeholder="OTP"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            type="password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={handlechange}
                            className="form-control"
                            placeholder="New Password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="text-white switch btn btn-light w-100 mb-2"
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <p className="text-center">
                    Didn't get the OTP?&nbsp;
                    <Link to={`/resendforgetpasswordotp?email=${encodeURIComponent(formData.email)}`}>
                        Resend OTP
                    </Link>
                </p>

                {message && (
                    <div className="alert alert-danger text-center mt-3" role="alert">
                        {message}
                    </div>
                )}
            </div>
        </div>


    )
}

export default Passwordreset