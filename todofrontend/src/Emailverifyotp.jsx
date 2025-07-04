import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios'



function Emailverifyotp() {

    const [formData, setformData] = useState({
        "email": "",
        "otp": "",
    })

    const [message, setMessage] = useState("")

    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const location = useLocation()

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const email = params.get("email");
        if (email) {
            setformData(prev => ({ ...prev, email: email }))
        }
    }, [location.search])

    const handlechange = (e) => {
        setformData({ ...formData, [e.target.name]: e.target.value })
    }

    async function handlesubmit(event) {
        event.preventDefault()
        if (loading) return
        setLoading(true)
        try {
            let response = await axios.post("http://127.0.0.1:8000/api/todo/verifyotp/", formData)
            navigate("/dashboard")
        }
        catch (error) {
            const errormessage = error.response?.data?.error || "OTP verification failed"
            setMessage(errormessage)
            setLoading(false)
        }
        finally {
            setLoading(false)
        }
    }
    return (
  <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 rounded-4 border p-4 p-sm-5 shadow bg-white">
        <h4 className="text-center mb-4 fw-bold">Verify Your Email</h4>

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
              name="otp"
              value={formData.otp}
              onChange={handlechange}
              className="form-control"
              placeholder="OTP"
              required
            />
          </div>

          <button
            type="submit"
            className="text-white switch btn btn-light w-100 mb-2"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <p className="text-center">
          Didn't get the OTP?&nbsp;
          <Link to={`/resendemailotp?email=${encodeURIComponent(formData.email)}`}>
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

export default Emailverifyotp