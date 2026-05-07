import { useState } from "react";

function Login({ onLoginSuccess, onShowSignup }) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");

        // Validation
        if (!username || !password) {
            setError("Username and password are required");
            return;
        }

        try {

            setLoading(true);

            const response = await fetch(
                "http://127.0.0.1:5000/login",
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
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message);
                return;
            }

            // Save login locally
            localStorage.setItem("username", data.username);

            // Notify parent component
            onLoginSuccess(data.username);

        } catch (error) {

            console.error("Login error:", error);

            setError("Unable to connect to server");

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="modal-overlay">

            <div className="modal-box">

                <h2>Login</h2>

                {error && (
                    <div className="modal-error">
                        {error}
                    </div>
                )}

                <form
                    className="modal-form"
                    onSubmit={handleLogin}
                >

                    <label>Username</label>

                    <input
                        type="text"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                        placeholder="Enter username"
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        placeholder="Enter password"
                    />

                    <div className="modal-buttons">

                        <button
                            type="submit"
                            className="add-btn"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        <button
                            type="button"
                            className="cancel-btn"
                        >
                            Signup
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default Login;