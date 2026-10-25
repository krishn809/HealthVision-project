import styles from "./styles.module.css";
import axios from "axios";
import { useRef, useState, useEffect } from "react";
import { FiMessageSquare, FiPlus, FiArrowLeft, FiSend, FiActivity, FiLogOut } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import BotResponse from "./BotResponse";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

const apiurl = process.env.REACT_APP_API_BASE_URL;

function Chatbot() {
	const [input, setInput] = useState("");
	const [error, setError] = useState("");
	const [showReportSummary, setShowReportSummary] = useState(true);
	const [messages, setMessages] = useState([
		{
			sender: "bot",
			text: "Hello! I am your Health Vision AI Assistant. You can ask me about your recent lab results, biomarker trends, or health questions."
		}
	]);
	const [conversations, setConversations] = useState([]);
	const [conversationID, setConversationID] = useState("");
	const inputRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		fetchConversations();
		setConversationID(generateConversationID());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchConversations = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) return;
			const response = await axios.get(
				`${apiurl}/conversations/user/${token}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			setConversations(response.data.conversations || []);
		} catch (error) {
			if (error.response?.status === 401) {
				handleLogout();
			} else {
				console.error("Error fetching conversations:", error);
			}
		}
	};

	const generateConversationID = () => uuidv4().replace(/-/g, "").substring(0, 24);

	const newChat = () => {
		setConversationID(generateConversationID());
		setMessages([
			{
				sender: "bot",
				text: "Started a new conversation. What health metrics or questions would you like to review?"
			}
		]);
	};

	const chatClicks = async (id) => {
		try {
			const token = localStorage.getItem("token");
			const response = await axios.get(
				`${apiurl}/conversations/conversation/${token}/${id}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			const loadedMessages = response.data.map(({ sender, message }) => ({
				sender,
				text: message,
			}));
			setMessages(loadedMessages);
			setConversationID(id);
		} catch (error) {
			console.error("Error fetching conversation:", error);
			setError("Error fetching conversation");
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/");
		window.location.reload();
	};

	const fetchBiomarkerData = async (name) => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				setError("No token found. Please log in again.");
				return null;
			}

			const response = await axios.get(
				`${apiurl}/bloodreport/history/${token}/${name}`
			);
			const history = response.data.map((record) => ({
				date: record.date,
				value: record.value,
				unit: record.unit,
				range: [
					record.normalRange?.min ?? 0,
					record.normalRange?.max ?? 0,
				],
				description: record.description || "No description available",
			}));

			const historyWithPadding = [
				{
					date: "01/01/2000",
					value: null,
					range: history[0]?.range || [0, 0],
				},
				...history,
				{
					date: "12/31/3000",
					value: null,
					range: history[history.length - 1]?.range || [0, 0],
				},
			];

			return historyWithPadding;
		} catch (err) {
			console.error("Error fetching biomarker data:", err);
			setError("Failed to load biomarker data.");
			return null;
		}
	};

	const llmReports = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				setError("No token found. Please log in again.");
				return null;
			}
			const response = await axios.get(
				`${apiurl}/bloodreport/llm/insights/${token}`
			);
			return response.data;
		} catch (err) {
			console.error("Error fetching reports:", err);
			return null;
		}
	};

	const sendMessage = async () => {
		if (!input.trim()) return;

		const userMessage = { sender: "user", text: input };
		setMessages((prevMessages) => [...prevMessages, userMessage]);

		let temp = input;
		setInput("");

		if (temp.startsWith("View Results for ")) {
			const biomarkerName = temp.replace("View Results for ", "").trim();
			if (!biomarkerName) {
				setMessages((prev) => [
					...prev,
					{ sender: "bot", text: "Please specify a biomarker name." },
				]);
				return;
			}
			try {
				const history = await fetchBiomarkerData(biomarkerName);
				if (history) {
					setMessages((prev) => [...prev, { sender: "chart", data: history }]);
				} else {
					setMessages((prev) => [
						...prev,
						{ sender: "bot", text: `No data found for biomarker: ${biomarkerName}` },
					]);
				}
			} catch (err) {
				setMessages((prev) => [
					...prev,
					{ sender: "bot", text: "Failed to fetch biomarker data. Please try again later." },
				]);
			}
			return;
		}

		try {
			const biodata = await llmReports();
			const token = localStorage.getItem("token");

			const response = await axios.post(`${apiurl}/conversations/chat`, {
				message: temp,
				messages: messages,
				data: biodata,
				token: token,
				conversationID,
				topic: temp,
			});

			setMessages((prev) => [
				...prev,
				{ sender: "bot", text: response.data.botResponse },
			]);
			fetchConversations();
		} catch (error) {
			console.error("Error sending message:", error);
			setMessages((prev) => [
				...prev,
				{ sender: "bot", text: "I'm having trouble connecting right now. Please check your connection or try again." },
			]);
		}
	};

	const handleInputChange = (e) => setInput(e.target.value);

	const handleKeyPress = (e) => {
		if (e.key === "Enter") sendMessage();
	};

	const clickInput = () => navigate("/reports/add");
	const toggleReportSummary = () => setShowReportSummary(!showReportSummary);

	const renderTooltipWithoutRange = ({ payload, ...rest }) => {
		const newPayload = payload ? payload.filter((x) => x.dataKey !== "range") : [];
		return <DefaultLegendContent payload={newPayload} {...rest} />;
	};

	const renderLegendWithoutRange = ({ payload, ...rest }) => {
		const newPayload = payload ? payload.filter((x) => x.dataKey !== "range") : [];
		return <DefaultLegendContent payload={newPayload} {...rest} />;
	};

	return (
		<div className={styles.chat_wrapper}>
			{/* Spatial Top Nav */}
			<div className={styles.nav_container}>
				<nav className={styles.navbar}>
					<div className={styles.button_nav_bar}>
						<button 
							className={styles.white_btn} 
							onClick={() => navigate("/")}
							title="Back to Dashboard"
						>
							<FiArrowLeft size={16} />
							<span>Dashboard</span>
						</button>
						<button className={styles.minimize_btn} onClick={toggleReportSummary}>
							{showReportSummary ? "Hide History" : "Show History"}
						</button>
						<button className={styles.new_chat_button} onClick={newChat} title="New Chat">
							<FiPlus size={16} />
							<span>New</span>
						</button>
					</div>

					<div className={styles.title_container} onClick={() => navigate("/")}>
						<div className={styles.brand_logo_circle}>
							<FiActivity size={18} />
						</div>
						<h1>Health Vision</h1>
					</div>

					<button className={styles.white_btn} onClick={handleLogout}>
						<FiLogOut size={15} />
						<span>Logout</span>
					</button>
				</nav>
			</div>

			{/* Spatial Chat Container */}
			<div className={styles.page}>
				{showReportSummary && (
					<aside className={styles.side_panel}>
						<div className={styles.chat_title}>
							<span>Previous Chats</span>
							<span className={styles.filter_pill_badge}>{conversations.length}</span>
						</div>
						<div className={styles.chat_summary}>
							{conversations.length === 0 ? (
								<p style={{ fontSize: "0.82rem", color: "var(--text-muted)", padding: "10px" }}>
									No previous chats yet. Start chatting below!
								</p>
							) : (
								conversations.slice().reverse().map((conv, index) => (
									<div
										key={index}
										className={styles.summary}
										onClick={() => chatClicks(conv.conversationID)}
									>
										<FiMessageSquare />
										<p>{conv.topic || "Health Consultation"}</p>
									</div>
								))
							)}
						</div>
					</aside>
				)}

				<section className={styles.chat}>
					<div className={styles.chat_container}>
						<div className={styles.chat_window}>
							{messages.map((message, index) =>
								message.sender === "chart" ? (
									<div 
										key={index} 
										style={{ 
											background: "#ffffff", 
											padding: "16px", 
											borderRadius: "20px", 
											border: "1px solid rgba(16, 185, 129, 0.2)",
											boxShadow: "0 8px 24px rgba(16, 185, 129, 0.08)",
											maxWidth: "680px"
										}}
									>
										<ResponsiveContainer width="100%" height={260}>
											<ComposedChart
												data={message.data}
												margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
											>
												<CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.12)" />
												<XAxis
													dataKey="date"
													tickFormatter={(date) => {
														const parts = date.split("/");
														return parts.length >= 3 ? `${parts[0]}/${parts[2].slice(2)}` : date;
													}}
													stroke="#7c9893"
												/>
												<YAxis stroke="#7c9893" />
												<Tooltip content={renderTooltipWithoutRange} />
												<Legend content={renderLegendWithoutRange} />
												<Area
													type="monotone"
													dataKey="range"
													fill="rgba(16, 185, 129, 0.18)"
													stroke="#10b981"
													connectNulls={true}
												/>
												<Line 
													type="monotone" 
													dataKey="value" 
													stroke="#073832" 
													strokeWidth={2.5} 
													dot={{ fill: "#10b981", r: 4 }}
												/>
											</ComposedChart>
										</ResponsiveContainer>
									</div>
								) : message.sender === "user" ? (
									<div key={index} className={styles.user_message}>
										{message.text}
									</div>
								) : (
									<div key={index} className={styles.bot_message}>
										<BotResponse response={message.text} />
									</div>
								)
							)}
						</div>

						{/* Quick Action Suggestion Chips */}
						<div className={styles.options_container}>
							<button
								className={styles.option_btn}
								onClick={() => {
									setInput("View Results for Glucose");
								}}
							>
								⚡ View Results for Glucose
							</button>
							<button
								className={styles.option_btn}
								onClick={() => navigate("/reports/results")}
							>
								📊 View All Biomarkers
							</button>
							<button
								className={styles.option_btn}
								onClick={() => {
									setInput("Summarize my latest health report");
								}}
							>
								📑 Discuss Latest Report
							</button>
						</div>

						{/* Spatial Floating Input Dock */}
						<div className={styles.input_container}>
							<div 
								className={styles.dropzone} 
								onClick={clickInput} 
								title="Attach medical lab report"
							>
								<FontAwesomeIcon icon={faCloudUploadAlt} />
								<input
									type="file"
									name="file"
									className={styles.dropzone_input}
									ref={inputRef}
									accept=".pdf,image/*"
								/>
							</div>

							<input
								type="text"
								className={styles.input}
								placeholder="Ask about biomarkers, lab tests, or symptoms..."
								value={input}
								onChange={handleInputChange}
								onKeyPress={handleKeyPress}
							/>

							<button className={styles.send_btn} onClick={sendMessage} title="Send Message">
								<span>Send</span>
								<FiSend size={15} />
							</button>
						</div>

						{error && <div className={styles.error}>{error}</div>}
					</div>
				</section>
			</div>
		</div>
	);
}

export default Chatbot;
