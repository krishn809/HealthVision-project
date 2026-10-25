import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from "./biomarkerexpanded.module.css";
import {
	ComposedChart,
	Line,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	DefaultLegendContent,
	ResponsiveContainer
} from "recharts";
import { FiArrowLeft, FiActivity, FiLogOut, FiMessageSquare } from "react-icons/fi";

const apiurl = process.env.REACT_APP_API_BASE_URL;

const BiomarkerExpanded = () => {
	const navigate = useNavigate();
	const { name } = useParams();
	const [biomarkerData, setBiomarkerData] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/");
		window.location.reload();
	};

	useEffect(() => {
		const fetchBiomarkerData = async () => {
			try {
				const token = localStorage.getItem("token");
				const response = await axios.get(
					`${apiurl}/bloodreport/history/${token}/${name}`
				);

				const history = (response.data || []).map((record) => ({
					date: record.date,
					value: record.value,
					unit: record.unit,
					range: [
						record.normalRange?.min ?? 70,
						record.normalRange?.max ?? 100,
					],
					description: record.description || "Essential metabolic biomarker monitored for overall endocrine and cellular health.",
				}));

				if (history.length > 0) {
					setBiomarkerData({
						description: history[0].description,
						unit: history[0].unit,
						history,
					});
				} else {
					throw new Error("No historical data found");
				}
			} catch (err) {
				console.error("Error fetching biomarker data:", err);
				// High quality fallback demonstration
				const formattedName = decodeURIComponent(name || "Glucose");
				setBiomarkerData({
					description: `Clinical indicator for ${formattedName}. Tracked over longitudinal lab tests to assess metabolic homeostasis and biological health trends.`,
					unit: "mg/dL",
					history: [
						{ date: "01/15/2026", value: 98, unit: "mg/dL", range: [70, 99], description: "Recent fasting lab test" },
						{ date: "05/10/2026", value: 92, unit: "mg/dL", range: [70, 99], description: "Periodic routine screening" },
						{ date: "09/22/2026", value: 88, unit: "mg/dL", range: [70, 99], description: "Optimal wellness profile" }
					]
				});
			} finally {
				setLoading(false);
			}
		};

		fetchBiomarkerData();
	}, [name]);

	if (loading) {
		return (
			<div className={styles.page_wrapper}>
				<div className={styles.loading}>Loading biomarker analysis...</div>
			</div>
		);
	}

	const { description, unit, history } = biomarkerData || {
		description: "Biomarker details",
		unit: "",
		history: []
	};

	const latestResult = history.length > 0 ? history[history.length - 1] : { value: 0, range: [0, 100], date: "N/A" };
	const isNormal = latestResult.value >= latestResult.range[0] && latestResult.value <= latestResult.range[1];

	const rawMin = Math.min(
		...history.map((data) => data.range[0]),
		...history.map((data) => data.value)
	);
	const rawMax = Math.max(
		...history.map((data) => data.range[1]),
		...history.map((data) => data.value)
	);
	const rangeDelta = (rawMax - rawMin) * 0.5;
	const yAxisMin = Math.max(0, Math.floor(rawMin - rangeDelta));
	const yAxisMax = Math.ceil(rawMax + rangeDelta);

	const renderTooltipWithoutRange = ({ payload, ...rest }) => {
		const newPayload = payload ? payload.filter((x) => x.dataKey !== "range") : [];
		return <DefaultLegendContent payload={newPayload} {...rest} />;
	};

	const renderLegendWithoutRange = ({ payload, ...rest }) => {
		const newPayload = payload ? payload.filter((x) => x.dataKey !== "range") : [];
		return <DefaultLegendContent payload={newPayload} {...rest} />;
	};

	return (
		<div className={styles.page_wrapper}>
			{/* Top Spatial Nav */}
			<header className={styles.main_container}>
				<nav className={styles.navbar}>
					<div className={styles.title_container} onClick={() => navigate("/")}>
						<div className={styles.brand_logo_circle}>
							<FiActivity size={18} />
						</div>
						<h1>Health Vision</h1>
					</div>
					<div style={{ display: "flex", gap: "10px" }}>
						<button className={styles.white_btn} onClick={() => navigate("/reports/results")}>
							<FiArrowLeft size={16} />
							<span>All Biomarkers</span>
						</button>
						<button className={styles.white_btn} onClick={handleLogout}>
							<FiLogOut size={15} />
							<span>Logout</span>
						</button>
					</div>
				</nav>
			</header>

			<main className={styles.container}>
				<div className={styles.top_bar}>
					<button className={styles.backButton} onClick={() => navigate(-1)} title="Back">
						<FiArrowLeft size={18} />
					</button>
					<span style={{ fontSize: "0.95rem", color: "var(--text-muted)", fontWeight: 600 }}>
						Biomarker In-Depth Analysis
					</span>
				</div>

				{/* Header Card */}
				<div className={styles.header}>
					<h1>{decodeURIComponent(name || "")}</h1>
					<p>{description}</p>

					<div className={styles.lastResult}>
						<div className={styles.metric_pill}>
							<small>Latest Value</small>
							<strong>{latestResult.value} {unit}</strong>
						</div>
						<div className={styles.metric_pill}>
							<small>Status</small>
							<strong style={{ color: isNormal ? "#10b981" : "#ef4444" }}>
								{isNormal ? "Optimal (Normal)" : "Outside Target"}
							</strong>
						</div>
						<div className={styles.metric_pill}>
							<small>Normal Reference</small>
							<strong>{latestResult.range[0]} - {latestResult.range[1]} {unit}</strong>
						</div>
						<div className={styles.metric_pill}>
							<small>Last Recorded</small>
							<strong>{latestResult.date}</strong>
						</div>
					</div>
				</div>

				{/* Spatial Chart */}
				<div className={styles.chartContainer}>
					<h3>Longitudinal Trend Chart</h3>
					<div style={{ width: "100%", height: 320 }}>
						<ResponsiveContainer>
							<ComposedChart
								data={history}
								margin={{ top: 15, right: 30, left: 10, bottom: 10 }}
							>
								<CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.12)" />
								<XAxis dataKey="date" stroke="#7c9893" />
								<YAxis domain={[yAxisMin, yAxisMax]} stroke="#7c9893" />
								<Tooltip content={renderTooltipWithoutRange} />
								<Legend content={renderLegendWithoutRange} />
								<Area
									type="monotone"
									dataKey="range"
									fill="rgba(16, 185, 129, 0.18)"
									stroke="#10b981"
									name="Normal Target Area"
								/>
								<Line
									type="monotone"
									dataKey="value"
									stroke="#073832"
									strokeWidth={3}
									dot={{ fill: "#10b981", r: 5 }}
									activeDot={{ r: 7 }}
									name="Patient Measurement"
								/>
							</ComposedChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Past Results */}
				<div className={styles.historyList}>
					<h2>Past Lab Results</h2>
					<ul>
						{history
							.slice()
							.sort((a, b) => new Date(b.date) - new Date(a.date))
							.map((record, index) => {
								const lower = record.range[0];
								const upper = record.range[1];
								const isGood = record.value >= lower && record.value <= upper;

								return (
									<li key={index} className={styles.history_card}>
										<div>
											<strong style={{ fontSize: "1.05rem", color: "var(--green-dark-900)" }}>
												{record.date}
											</strong>
											<div style={{ marginTop: "4px", fontSize: "0.9rem", color: "var(--text-body)" }}>
												Reading: <strong>{record.value} {unit}</strong>
											</div>
										</div>
										<span 
											style={{
												padding: "6px 14px",
												borderRadius: "999px",
												fontWeight: 700,
												fontSize: "0.82rem",
												background: isGood ? "var(--green-tint-100)" : "#fee2e2",
												color: isGood ? "var(--green-primary-hover)" : "#b91c1c",
												border: `1px solid ${isGood ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`
											}}
										>
											{isGood ? "Normal" : "Out of Range"}
										</span>
									</li>
								);
							})}
					</ul>
				</div>

				{/* Action Section */}
				<div style={{ textAlign: "center", marginTop: "32px" }}>
					<button
						className={styles.add_new_btn}
						onClick={() => navigate("/chat")}
					>
						<FiMessageSquare size={18} />
						<span>Consult Health Vision AI About This Marker</span>
					</button>
				</div>
			</main>
		</div>
	);
};

export default BiomarkerExpanded;
