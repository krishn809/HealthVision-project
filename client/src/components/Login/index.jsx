import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";
import { FiActivity, FiZap } from "react-icons/fi";

const apiurl = process.env.REACT_APP_API_BASE_URL;

const Login = () => {
	const [data, setData] = useState({ email: "demo@123", password: "password@24" });
	const [error, setError] = useState("");

	const handleChange = ({ currentTarget: input }) => {
		setData({ ...data, [input.name]: input.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const url = `${apiurl}/auth`;
			const { data: res } = await axios.post(url, data);
			localStorage.setItem("token", res.data);
			window.location = "/";
		} catch (error) {
			if (
				error.response &&
				error.response.status >= 400 &&
				error.response.status <= 500
			) {
				setError(error.response.data.message);
			} else {
				// Allow demo access if backend is not running locally
				localStorage.setItem("token", "demo-token-12345");
				window.location = "/";
			}
		}
	};

	const fillDemoCredentials = () => {
		setData({ email: "demo@123", password: "password@24" });
		setError("");
	};

	return (
		<div className={styles.login_container}>
			<div className={styles.login_form_container}>
				<div className={styles.left}>
					<form className={styles.form_container} onSubmit={handleSubmit}>
						<div className={styles.brand_badge}>
							<FiActivity size={16} />
							<span>Health Vision Diagnostics</span>
						</div>
						<h1>Welcome Back</h1>
						<p className={styles.form_subtitle}>
							Sign in to access your biomarker analysis and medical insights.
						</p>

						<input
							type="text"
							placeholder="Email address"
							name="email"
							onChange={handleChange}
							value={data.email}
							required
							className={styles.input}
						/>
						<input
							type="password"
							placeholder="Password"
							name="password"
							onChange={handleChange}
							value={data.password}
							required
							className={styles.input}
						/>

						{error && <div className={styles.error_msg}>{error}</div>}

						<button type="submit" className={styles.green_btn}>
							Sign In &rarr;
						</button>

						{/* Demo Account Quick Access Card */}
						<div className={styles.demo_card}>
							<div className={styles.demo_header}>
								<span className={styles.demo_badge}>Demo Account Ready</span>
								<button
									type="button"
									className={styles.demo_fill_btn}
									onClick={fillDemoCredentials}
									title="Click to auto-fill Krishn Kushwaha's demo details"
								>
									<FiZap size={11} style={{ marginRight: 4 }} />
									Auto-Fill
								</button>
							</div>
							<div className={styles.demo_credentials}>
								<div><strong>Patient:</strong> Krishn Kushwaha (Age: 20, 162 lbs., Male)</div>
								<div><strong>Email:</strong> <code>demo@123</code></div>
								<div><strong>Password:</strong> <code>password@24</code></div>
							</div>
						</div>
					</form>
				</div>
				<div className={styles.right}>
					<h1>New to Health Vision?</h1>
					<p>
						Join thousands tracking biomarkers and clinical lab test reports with preventive spatial AI.
					</p>
					<Link to="/signup">
						<button type="button" className={styles.white_btn}>
							Create Free Account
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Login;
