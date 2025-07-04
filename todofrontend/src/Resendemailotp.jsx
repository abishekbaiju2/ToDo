import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Resendemailotp() {

    const [formData, setformData] = useState({
        "email": ""
    })

    const location = useLocation()

    const [loading, setLoading] = useState(false)

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

    const [message, setMessage] = useState("")

    const navigate = useNavigate()

    const handlechange = (e) => {
        setformData({ ...formData, [e.target.name]: e.target.value })
    }

    async function handlesubmit(event) {
        event.preventDefault()
        setLoading(true)
        try {
            let response = await axios.post("http://127.0.0.1:8000/api/todo/resendotp/", formData)
            navigate(`/emailverify?email=${encodeURIComponent(formData.email)}`)
        }
        catch (error) {
            const errormessage = error.response?.data?.error || "OTP verification failed"
            setMessage(errormessage)
        }finally {
    setLoading(false)
  }
    }

    return (

        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                <div className="rounded-4 border p-4 p-sm-5 shadow bg-white">
                    <h4 className="text-center mb-3 fw-bold">Verify Your Email</h4>

                    <form onSubmit={handlesubmit}>
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                className="form-control mb-3"
                                onChange={handlechange}
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
        </div>

    )
}

export default Resendemailotp