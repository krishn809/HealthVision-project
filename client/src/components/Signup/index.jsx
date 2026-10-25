import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import { FiActivity } from "react-icons/fi";

const apiurl = process.env.REACT_APP_API_BASE_URL;

const Signup = () => {
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        age: "",
        height: "",
        weight: "",
        ethnicity: "",
        sex: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = ({ currentTarget: input }) => {
        setData({ ...data, [input.name]: input.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = `${apiurl}/users`;
            const { data: res } = await axios.post(url, data);
            navigate("/login");
        } catch (error) {
            if (
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
            ) {
                setError(error.response.data.message);
            } else {
                // Allow fallback navigate in dev/offline
                navigate("/login");
            }
        }
    };

    return (
        <div className={styles.signup_container}>
            <div className={styles.signup_form_container}>
                <div className={styles.left}>
                    <h1>Already Have an Account?</h1>
                    <p>
                        Sign in to monitor your health progress, biomarker history, and past consultations.
                    </p>
                    <Link to="/login">
                        <button type="button" className={styles.white_btn}>
                            Sign In &rarr;
                        </button>
                    </Link>
                </div>

                <div className={styles.right}>
                    <form className={styles.form_container} onSubmit={handleSubmit}>
                        <div className={styles.brand_badge}>
                            <FiActivity size={16} />
                            <span>Health Vision Diagnostics Setup</span>
                        </div>
                        <h1>Create Your Profile</h1>
                        <p className={styles.form_subtitle}>
                            Enter your clinical metrics to calculate personalized reference ranges.
                        </p>

                        <div className={styles.input_grid}>
                            <input
                                type="text"
                                placeholder="First Name"
                                name="firstName"
                                onChange={handleChange}
                                value={data.firstName}
                                required
                                className={styles.input}
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                name="lastName"
                                onChange={handleChange}
                                value={data.lastName}
                                required
                                className={styles.input}
                            />
                            <input
                                type="text"
                                placeholder="Email Address"
                                name="email"
                                onChange={handleChange}
                                value={data.email}
                                required
                                className={`${styles.input} ${styles.input_full}`}
                            />
                            <input
                                type="password"
                                placeholder="Create Password"
                                name="password"
                                onChange={handleChange}
                                value={data.password}
                                required
                                className={`${styles.input} ${styles.input_full}`}
                            />
                            <input
                                type="number"
                                placeholder="Age (years)"
                                name="age"
                                onChange={handleChange}
                                value={data.age}
                                required
                                className={styles.input}
                            />
                            <input
                                type="text"
                                placeholder="Height (e.g. 5'10)"
                                name="height"
                                onChange={handleChange}
                                value={data.height}
                                required
                                className={styles.input}
                            />
                            <input
                                type="text"
                                placeholder="Weight (e.g. 175 lbs)"
                                name="weight"
                                onChange={handleChange}
                                value={data.weight}
                                required
                                className={styles.input}
                            />
                            <input
                                type="text"
                                placeholder="Ethnicity"
                                name="ethnicity"
                                onChange={handleChange}
                                value={data.ethnicity}
                                required
                                className={styles.input}
                            />
                            <select
                                name="sex"
                                onChange={handleChange}
                                value={data.sex}
                                required
                                className={`${styles.input} ${styles.input_full}`}
                            >
                                <option value="" disabled>
                                    Select Biological Sex (for Biomarker Baselines)
                                </option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>

                            {error && <div className={styles.error_msg}>{error}</div>}

                            <div className={styles.input_full}>
                                <button type="submit" className={styles.green_btn}>
                                    Complete Registration &rarr;
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
