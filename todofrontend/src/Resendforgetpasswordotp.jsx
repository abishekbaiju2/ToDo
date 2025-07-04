import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Resendforgetpasswordotp() {

    const [formData, setformData] = useState({
        "email": ""
    })

    const location = useLocation()

      const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const [message, setMessage] = useState('');

    useEffect(
        () => {
            const params = new URLSearchParams(location.search)
            const email = params.get('email')
            if (email) {
                setformData(prev => ({ ...prev, email: email }))
            }
        },
        [location.search]
    )

    const handlechange = (e) => {
        setformData({ ...formData, [e.target.name]: e.target.value })
    }


    async function handlesubmit(event) {
        event.preventDefault()
        setLoading(true)
        try {
            let response = await axios.post("http://127.0.0.1:8000/api/todo/resendpasswordotp/", formData)
            navigate(`/passwordreset?email=${encodeURIComponent(formData.email)}`)
        }
        catch (error) {
            const errormsg = error.response?.data?.error || "Failed to resend OTP.";
            setMessage(errormsg)
        }finally {
    setLoading(false)
  }
    }

    return (
        <div className="container min-vh-100 d-flex justify-content-center align-items-center">
            <div className="bg-white border rounded-4 shadow p-4 p-sm-5 col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                <h4 className="text-center mb-3 fw-bold">Verify Your Email</h4>

                <form onSubmit={handlesubmit}>
                    <div className="mb-3">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handlechange}
                            className="form-control"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <button type="submit" className="text-white switch btn btn-light w-100 mb-2" disabled={loading}>
                        {loading ? "Sending..." : "Resend OTP"}
                    </button>
                </form>

                {message && (
                    <div className="alert alert-danger text-center mt-3" role="alert">
                        {message}
                    </div>
                )}
            </div>
        </div>

    )
}

export default Resendforgetpasswordotp