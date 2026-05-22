const axios = require("axios");
const Course = require("../models/Course");
const User = require("../models/User");
const Category = require("../models/Category");

exports.aiChat = async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: "Message required" });
  }

  try {
    // Fetch available courses, instructors, and categories
    const publishedCourses = await Course.find({
      status: "Published",
      isAnonymized: { $ne: true },
    })
      .populate("instructor", "firstName lastName email image")
      .populate("category", "name")
      .select("courseName courseDescription whatYouWillLearn price tag instructor instructorName category");

    const categories = await Category.find().select("name description");

    // Build knowledge base for the chatbot
    let knowledgeBase = `You are EduAI Tutor, an AI assistant for the EduAI Learning Management System (LMS) website.

IMPORTANT: You ONLY answer questions about the EduAI website's courses, instructors, features, and content. 
- Do NOT provide general educational answers about topics outside EduAI's courses
- Do NOT answer general knowledge questions (like "What is photosynthesis?" unless it's about an EduAI course)
- If asked about something not in EduAI, politely redirect: "This isn't covered in our current courses. Check our course catalog!"

AVAILABLE COURSES ON EAUI:
`;

    publishedCourses.forEach((course) => {
      const instructorName = course.instructor
        ? `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim()
        : course.instructorName || "EduAI Instructor";

      knowledgeBase += `\n- **${course.courseName}** (Instructor: ${instructorName})
  Price: ₹${course.price}
  Description: ${course.courseDescription}
  What You'll Learn: ${course.whatYouWillLearn}
  Category: ${course.category?.name || "Uncategorized"}`;
    });

    knowledgeBase += `\n\nCOURSE CATEGORIES:`;
    categories.forEach((cat) => {
      knowledgeBase += `\n- ${cat.name}: ${cat.description || "Learn more about this category on our platform"}`;
    });

    knowledgeBase += `\n\nGUIDE FOR RESPONSES:
1. ALWAYS respond in English only - never use Punjabi, Hindi, or other languages
2. Answer length should match the question:
   - Simple questions (course name, price, instructor) → 1-2 sentences
   - Medium questions (course details, features) → 2-4 sentences
   - Complex questions (enrollment process, comparisons) → 4-6 sentences
3. If student asks about a specific course → provide course details concisely
4. If they ask about an instructor → tell which courses that instructor teaches
5. If they ask about categories → describe available categories
6. If they ask about enrollment, pricing, or features → explain clearly but briefly
7. If it's general knowledge NOT related to EduAI → politely decline and redirect to our courses
8. Always encourage them to explore available courses
9. Be friendly and professional in tone
10. Avoid unnecessary long paragraphs - keep responses focused and readable`;

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: knowledgeBase,
          },
        ],
      },
    ];

    // History format setup
    if (history && history.length > 0) {
      history.forEach((msg) => {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      });
    }

    // Current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: contents,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
          topP: 0.95,
        },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    // Response extraction
    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      response.data?.candidates?.[0]?.content?.text ||
      "EduAI Tutor abhi busy hai. Please try again."

    // ── Log AI usage for analytics ──────────────────────────────
    const tokensUsed =
      response.data?.usageMetadata?.totalTokenCount ||
      response.data?.usageMetadata?.candidatesTokenCount ||
      Math.ceil((message?.length || 0) / 4) // fallback estimate

    const userId = req.user?.id || null
    exports.logAIUsage({ userId, message, tokensUsed, feature: "chatbot" })
    // ────────────────────────────────────────────────────────────

    return res.status(200).json({
      success: true,
      reply,
    })

  } catch (error) {
    console.log("AI Chat Error Detail:", error.response?.data || error.message);
    
    return res.status(500).json({
      success: false,
      message: "AI service error",
      reply: "EduAI Tutor abhi busy hai. Please check terminal for error.",
    });
  }
};

// ── Log AI usage (called internally after each AI response) ─────────────────
const AIUsageLog = require("../models/AIUsageLog")

exports.logAIUsage = async ({ userId, message, tokensUsed, feature = "chatbot" }) => {
  try {
    // Simple topic detection from message keywords
    const msg = (message || "").toLowerCase()
    let topic = "General"
    if (msg.match(/react|javascript|js|node/)) topic = "Web Development"
    else if (msg.match(/python|django|flask/)) topic = "Python"
    else if (msg.match(/machine learning|ml|ai|neural/)) topic = "AI & ML"
    else if (msg.match(/data|sql|database/)) topic = "Data Science"
    else if (msg.match(/course|enroll|price|fee/)) topic = "Course Enquiry"
    else if (msg.match(/quiz|test|exam/)) topic = "Assessment"
    else if (msg.match(/schedule|timetable|plan/)) topic = "Study Planning"

    await AIUsageLog.create({ user: userId, message: message?.slice(0, 200), tokensUsed, topic, feature })
  } catch (e) { /* non-critical, silent */ }
}
