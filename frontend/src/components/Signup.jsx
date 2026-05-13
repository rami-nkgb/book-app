import { useState } from "react";

function Signup({onSignupSuccess, onShowLogin}){
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSignup = async (e) => {
        e.preventDefault()

        setError("")
        setSuccess("")

        // Validation
        if (!username || !password) {
            setError("Username and password are required")
            return
        }
    
            try {
            setLoading(true)

            const response = await fetch("http://127.0.0.1:5000/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            )

            const data = await response.json()
            if (!response.ok) {
                setError(data.message)
                return
            }

            setSuccess(data.message)

            // Optional auto-login
            localStorage.setItem("username", username)

            // Redirect to home page
            onSignupSuccess(username)
        } 
        catch (error) {
            console.error("Signup error:", error)
            setError("Unable to connect to server")
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h2>Signup</h2>
                {error && (
                    <div className="modal-error">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="status-msg">
                        {success}
                    </div>
                )}

                <form className="modal-form" onSubmit={handleSignup}>

                    <label>Username</label>

                    <input
                        type="text"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                        placeholder="Choose username"
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        placeholder="Choose password"
                    />

                    <div className="modal-buttons">
                        <button
                            type="submit"
                            className="add-btn"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Signup"}
                        </button>

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onShowLogin}
                        >
                            Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Signup;