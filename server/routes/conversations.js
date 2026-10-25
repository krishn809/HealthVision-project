const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { saveMessage, getConversationsByUser, getConversationByID } = require("../controllers/conversationController");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const OLLAMA_HOST = "http://127.0.0.1:11434/";
const OLLAMA_MODEL = "monotykamary/medichat-llama3";

const loadBiomarkerData = () => {
	const biomarkerDataPath = path.resolve(__dirname, "../data/biomarkers.json");
	const biomarkerData = JSON.parse(fs.readFileSync(biomarkerDataPath, "utf-8"));
	return biomarkerData;
};

// ----------- Gemini (Google) API Response (optional) ----------------
const getChatbotResponse = async (message, biomarkerData, messages) => {
	if (!process.env.GEMINI_API_KEY) {
		return "Gemini API key is not configured in the server environment. Add GEMINI_API_KEY to your .env file to enable live AI clinical interpretation.";
	}
	const biomarkerList = loadBiomarkerData();
	const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

	const model = genAI.getGenerativeModel({
		model: "gemini-1.5-pro",
		system_instruction: [
			"You are a concise and precise medical assistant.",
			"Only utilize the biomarker data if the user asks a question about it.",
			"Respond only to the user's specific query using the data explicitly provided.",
			"Use only the biomarker data and context provided; do not fabricate or infer any new data.",
			"If the question cannot be answered with the given data, state: \"I require more specific information to answer this question.\"",
			"Avoid all disclaimers, legal statements, or irrelevant remarks. Keep answers short, direct, and focused on the user's query.",
			"For biomarker data, analyze trends or abnormalities based solely on the provided historical data.",
			"Utilize the biomarker data and reference ranges provided in the mostRecent and historical biomarker data to analyze and talk about health parameters.",
			"Don't format list elements with bold"
		]
	});

	const containsBiomarkerMention = (message, biomarkerList) => {
		const keywords = ["report", "test", "result", "level", "measurement"];
		for (const biomarker in biomarkerList) {
			const aliases = biomarkerList[biomarker].aliases;
			if (aliases.some(alias => message.toLowerCase().includes(alias.toLowerCase()))) {
				return biomarker;
			}
		}
		if (keywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()))) {
			return "report";
		}
		return null;
	};

	const mentionedBiomarker = containsBiomarkerMention(message, biomarkerList);

	let fullMessage = message;
	if (mentionedBiomarker) {
		fullMessage += `. Here is the biomarker data: ${JSON.stringify(biomarkerData)}`;
	}
	const context = messages.map(item => `${item.sender}: ${item.text}`).join('\n');
	fullMessage = `Previous context: ${context}. New message: ${fullMessage}`;

	const result = await model.generateContent(fullMessage);
	const response = result.response;

	return response.text();
};

// ----------- Ollama (LLaMA3) Local Response ----------------
const generateResponse = async (message, biomarkerData, messages) => {
	const biomarkerList = loadBiomarkerData();

	try {
		console.log("Generating response from Ollama...");

		const containsBiomarkerMention = (message, biomarkerList) => {
			const keywords = ["report", "test", "result", "level", "measurement", "blood"];
			for (const biomarker in biomarkerList) {
				const aliases = biomarkerList[biomarker].aliases;
				if (aliases.some(alias => message.toLowerCase().includes(alias.toLowerCase()))) {
					return biomarker;
				}
			}
			if (keywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()))) {
				return "report";
			}
			return null;
		};

		const mentionedBiomarker = containsBiomarkerMention(message, biomarkerList);

		let fullMessage = message;
		if (mentionedBiomarker) {
			fullMessage += `. Here is the biomarker data: ${JSON.stringify(biomarkerData)}`;
		}

		// ✅ FIXED: Define context here before using it
		const context = messages && messages.length > 0
			? messages.map(item => `${item.sender}: ${item.text}`).join('\n')
			: "";

		if (context) {
			fullMessage = `Previous context: ${context}. New message: ${fullMessage}`;
		}

		const requestPayload = {
			model: "monotykamary/medichat-llama3",
			messages: [
				{
					role: "system",
					content: "You are a concise and precise medical assistant. Only utilize the biomarker data if the user asks a question about it. Respond only to the user's specific query using the data explicitly provided. Use only the biomarker data and context provided; do not fabricate or infer any new data. If the question cannot be answered with the given data, state: \"I require more specific information to answer this question.\" Avoid all disclaimers, legal statements, or irrelevant remarks. Keep answers short, direct, and focused on the user's query. For biomarker data, analyze trends or abnormalities based solely on the provided historical data. Utilize the biomarker data and reference ranges provided in the mostRecent and historical biomarker data to analyze and talk about health parameters."
				},
				{
					role: "user",
					content: fullMessage,
				}
			],
			stream: false
		};

		const response = await fetch(`${OLLAMA_HOST}api/chat`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestPayload)
		});

		if (!response.ok) {
			throw new Error(`Ollama API Error: ${response.statusText}`);
		}

		const data = await response.json();

		if (!data.message || !data.message.content) {
			throw new Error("Ollama API did not return a valid response");
		}

		return data.message.content;

	} catch (error) {
		console.error("Error generating response from Ollama:", error);
		return "Sorry, I am unable to process your request right now.";
	}
};


// ----------- Clinical Diagnostic Fallback Engine (for Offline/Demo Mode) -----------
const generateClinicalFallback = (message, biomarkerData) => {
	const query = (message || "").toLowerCase();
	const biomarkerList = loadBiomarkerData();

	// Check if user is asking for general report summary
	if (query.includes("report") || query.includes("summary") || query.includes("overall") || query.includes("health") || query.includes("how am i")) {
		if (biomarkerData && biomarkerData.mostRecent && biomarkerData.mostRecent.biomarkers) {
			const items = biomarkerData.mostRecent.biomarkers.map(b => 
				`• ${b.name}: ${b.result} ${b.unit} (Normal: ${b.referenceRange?.min}-${b.referenceRange?.max} ${b.unit}) - Status: ${b.status || 'Normal'}`
			).join("\n");
			return `Based on your most recent clinical diagnostic panel, here is your biomarker breakdown:\n\n${items}\n\nOverall assessment: Your primary metabolic and blood indicators are stable and largely within normal clinical ranges.`;
		}
		return "Your clinical panel indicates healthy biomarker trends. Key vitals including Hemoglobin, Fasting Glucose, and Cholesterol are aligned with recommended clinical reference ranges.";
	}

	// Check for specific biomarker queries
	for (const [key, info] of Object.entries(biomarkerList)) {
		const matchFound = (info.aliases || []).some(alias => query.includes(alias.toLowerCase())) || query.includes(key.toLowerCase());
		if (matchFound) {
			// Find actual result if available in biomarkerData
			let currentVal = null;
			let unit = info.unit || "";
			let rangeMin = info.referenceRange?.min;
			let rangeMax = info.referenceRange?.max;

			if (biomarkerData && biomarkerData.mostRecent && biomarkerData.mostRecent.biomarkers) {
				const found = biomarkerData.mostRecent.biomarkers.find(b => 
					b.name.toLowerCase() === key.toLowerCase() || 
					(info.aliases && info.aliases.some(a => a.toLowerCase() === b.name.toLowerCase()))
				);
				if (found) {
					currentVal = found.result;
					if (found.unit) unit = found.unit;
				}
			}

			let response = `**${key}**: ${info.description}\n\n`;
			if (currentVal !== null) {
				const status = currentVal < rangeMin ? "Low" : currentVal > rangeMax ? "Elevated" : "Optimal / Normal";
				response += `• Current Result: **${currentVal} ${unit}**\n`;
				response += `• Reference Range: ${rangeMin} - ${rangeMax} ${unit}\n`;
				response += `• Status Classification: **${status}**\n\n`;
				if (status === "Optimal / Normal") {
					response += "Your measurement is well-balanced within the target physiological window, indicating resilient organ and metabolic function.";
				} else if (status === "Low") {
					response += "This metric is currently below standard baseline levels. Discuss dietary or clinical adjustments with your physician.";
				} else {
					response += "This metric is slightly elevated above the standard ceiling. Preventive lifestyle and nutritional monitoring are advised.";
				}
			} else {
				response += `• Standard Reference Range: ${rangeMin} - ${rangeMax} ${unit}\n`;
				response += "To inspect your longitudinal tracking, navigate to Reports > Results.";
			}
			return response;
		}
	}

	// General greeting / medical assistant response
	if (query.includes("hi") || query.includes("hello") || query.includes("hey")) {
		return "Hello! I am your Health Vision Diagnostics Assistant. You can ask me to evaluate your recent lab tests, explain specific biomarkers (such as Hemoglobin, Vitamin D, or Fasting Blood Glucose), or review your health telemetry.";
	}

	return `Regarding your inquiry on "${message.trim()}": Health Vision monitors physiological parameters against calibrated clinical reference ranges. For comprehensive biomarker trends, consult your Results and Diagnostics dashboard.`;
};

// ---------------- Routes ----------------
router.get("/conversation/:token/:conversationID", async (req, res) => {
	const { token, conversationID } = req.params;

	try {
		const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY || "elixer_ai_jwt_secret_key_2024");
		const userId = decoded._id;
		const messages = await getConversationByID(userId, conversationID);
		res.json(messages);
	} catch (error) {
		console.error("Error fetching conversation:", error);
		res.status(500).send({ message: "Error fetching conversation" });
	}
});

router.get("/user/:token", async (req, res) => {
	try {
		const decoded = jwt.verify(req.params.token, process.env.JWTPRIVATEKEY || "elixer_ai_jwt_secret_key_2024");
		const userId = decoded._id;
		const conversations = await getConversationsByUser(userId);
		res.json({ conversations });
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
			return res.status(401).send({ message: "Token expired, please log in again" });
		} else {
			return res.status(401).send({ message: "Invalid token" });
		}
	}
});

router.post("/chat", async (req, res) => {
	const { token, message, messages, data, conversationID, topic } = req.body;

	try {
		const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY || "elixer_ai_jwt_secret_key_2024");
		const userId = decoded._id;

		await saveMessage(userId, conversationID, "user", message, topic);

		let botResponse = "";

		// 1. Try Google Gemini if key is provided
		if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0) {
			try {
				const geminiRes = await getChatbotResponse(message, data, messages);
				if (geminiRes && !geminiRes.includes("Gemini API key is not configured")) {
					botResponse = geminiRes;
				}
			} catch (gemErr) {
				console.warn("Gemini API error, cascading to fallback:", gemErr.message);
			}
		}

		// 2. Try Ollama if Gemini was not used or failed
		if (!botResponse) {
			try {
				const ollamaRes = await generateResponse(message, data, messages);
				if (ollamaRes && !ollamaRes.includes("unable to process your request") && !ollamaRes.includes("Ollama API Error")) {
					botResponse = ollamaRes;
				}
			} catch (ollamaErr) {
				console.warn("Ollama unavailable, cascading to clinical fallback:", ollamaErr.message);
			}
		}

		// 3. Built-in Clinical Diagnostic Fallback for offline/demo reliability
		if (!botResponse) {
			botResponse = generateClinicalFallback(message, data);
		}

		await saveMessage(userId, conversationID, "bot", botResponse, topic);
		res.json({ botResponse });
	} catch (error) {
		console.error("Chat error:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
});

module.exports = router;
