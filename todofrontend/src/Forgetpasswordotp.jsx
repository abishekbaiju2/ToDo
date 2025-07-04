import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

function Forgetpasswordotp() {

    const [formData, setformData] = useState({ email: "" });
    const [message, setMessage] = useState("")

    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const location = useLocation()

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
        setLoading(true)
        try {
            let response = await axios.post("http://127.0.0.1:8000/api/todo/forgetpasswordotp/", formData)

            navigate(`/passwordreset?email=${encodeURIComponent(formData.email)}`)
        }
        catch (error) {


            const data = error.response?.data;

            let errormessage = "Something went wrong.";

            if (typeof data === "string") {
                errormessage = data;
            } else if (data?.error) {
                errormessage = data.error;
            } else if (data && typeof data === "object") {
                const firstKey = Object.keys(data)[0];
                if (firstKey && Array.isArray(data[firstKey])) {
                    errormessage = data[firstKey][0];
                }
            }
            setMessage(errormessage);
        }finally{
            setLoading(false)
        }
    }


    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 rounded-4 border p-4 p-sm-5 shadow bg-white">
                <h4 className="text-center mb-3 fw-bold">Verify Your Email</h4>
                <form onSubmit={handlesubmit}>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handlechange}
                        placeholder="Email"
                        required
                        className="form-control mb-3"
                    />
                    <button type="submit" className="btn btn-outline-light text-white w-100 mb-2 switch" disabled={loading}>
                        {loading ? "Submitting..." : "Submit"}
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

export default Forgetpasswordotp