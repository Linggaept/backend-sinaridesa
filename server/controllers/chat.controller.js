const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const jwt = require("jsonwebtoken");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to generate a unique slug
const generateUniqueSlug = async (message) => {
  const slugPrompt = `Summarize the following user query into a 3-5 word, URL-friendly slug: "${message}"`;
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  const result = await model.generateContent(slugPrompt);
  const response = await result.response;
  let slug = response
    .text()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");

  // Ensure slug is unique
  const existing = await prisma.chatHistory.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }
  return slug;
};

const startNewChat = async (req, res) => {
  const { message } = req.body;
  const user = req.user;

  if (!message) {
    return res
      .status(400)
      .json({ status: "fail", message: "Message is required." });
  }

  try {
    // 1. Create a new ChatHistory
    const chatHistory = await prisma.chatHistory.create({
      data: { userId: user ? user.userId : null },
    });

    // 2. Get AI response for the first message
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      generationConfig,
      systemInstruction:
        "Anda adalah AI Sinari Desa, asisten yang membantu untuk aplikasi Sinari Desa. Nada bicara Anda ramah dan profesional. Saat ditanya siapa Anda, Anda harus menjawab dengan 'saya adalah AI Sinari Desa'. Jangan terlibat dalam percakapan panjang dan spekulatif tentang orang yang tidak Anda kenal; cukup nyatakan bahwa Anda tidak memiliki informasi tersebut.",
    });
    const chatSession = model.startChat({ history: [] });
    const result = await chatSession.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // 3. Save first user message and AI response
    await prisma.chatDetail.createMany({
      data: [
        { chatHistoryId: chatHistory.id, role: "user", parts: message },
        { chatHistoryId: chatHistory.id, role: "model", parts: text },
      ],
    });

    // 4. Generate and save the slug
    const slug = await generateUniqueSlug(message);
    await prisma.chatHistory.update({
      where: { id: chatHistory.id },
      data: { slug },
    });

    // 5. Handle token for unauthenticated users
    let temporaryToken = null;
    if (!user) {
      temporaryToken = jwt.sign(
        { chatHistoryId: chatHistory.id, messageCount: 1 },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
    }

    // 6. Return the response
    const responseData = {
      status: "success",
      message: "New chat started successfully.",
      data: { response: text, slug: slug, chatHistoryId: chatHistory.id },
    };

    if (temporaryToken) {
      responseData.data.token = temporaryToken;
    }

    res.status(201).json(responseData);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An internal server error occurred.",
      error: error.message,
    });
  }
};

const continueChat = async (req, res) => {
  const { slug } = req.params;
  const { message } = req.body;
  const user = req.user;

  if (!message) {
    return res
      .status(400)
      .json({ status: "fail", message: "Message is required." });
  }

  try {
    // 1. Find the chat history by slug
    const chatHistory = await prisma.chatHistory.findUnique({
      where: { slug },
      include: { details: true },
    });

    if (!chatHistory) {
      return res
        .status(404)
        .json({ status: "fail", message: "Chat history not found." });
    }

    // Authorization check: Ensure user can access this chat
    if (chatHistory.userId && (!user || chatHistory.userId !== user.userId)) {
      return res.status(403).json({
        status: "fail",
        message: "Forbidden. You do not have access to this chat history.",
      });
    }

    // Unauthenticated user message limit check
    let temporaryToken = null;
    if (!user) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded.messageCount >= 10) {
            return res.status(429).json({
              status: "fail",
              message:
                "You have reached the message limit. Please log in to continue.",
            });
          }
          // Update token for the next request
          temporaryToken = jwt.sign(
            {
              chatHistoryId: chatHistory.id,
              messageCount: decoded.messageCount + 1,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );
        } catch (err) {
          // Invalid token, but let them send one message to get a new token
        }
      }
    }

    // 2. Get AI response based on history
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      generationConfig,
      systemInstruction:
        "Anda adalah AI Sinari Desa, asisten yang membantu untuk aplikasi Sinari Desa. Nada bicara Anda ramah dan profesional. Saat ditanya siapa Anda, Anda harus menjawab dengan 'saya adalah AI Sinari Desa'. Jangan terlibat dalam percakapan panjang dan spekulatif tentang orang yang tidak Anda kenal; cukup nyatakan bahwa Anda tidak memiliki informasi tersebut.",
    });
    const chatSession = model.startChat({
      history: chatHistory.details.map((detail) => ({
        role: detail.role,
        parts: [{ text: detail.parts }],
      })),
    });
    const result = await chatSession.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // 3. Save the new messages
    await prisma.chatDetail.createMany({
      data: [
        { chatHistoryId: chatHistory.id, role: "user", parts: message },
        { chatHistoryId: chatHistory.id, role: "model", parts: text },
      ],
    });

    // 4. Return the response
    const responseData = {
      status: "success",
      message: "Message sent successfully.",
      data: { response: text },
    };
    if (temporaryToken) {
      responseData.data.token = temporaryToken;
    }

    res.json(responseData);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An internal server error occurred.",
      error: error.message,
    });
  }
};

const getChatHistoryBySlug = async (req, res) => {
  const { slug } = req.params;
  const user = req.user;
  try {
    const chatHistory = await prisma.chatHistory.findUnique({
      where: { slug },
      include: {
        details: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!chatHistory) {
      return res
        .status(404)
        .json({ status: "fail", message: "Chat history not found." });
    }

    // Authorization check
    if (chatHistory.userId && (!user || chatHistory.userId !== user.userId)) {
      return res.status(403).json({
        status: "fail",
        message: "Forbidden. You do not have access to this chat history.",
      });
    }

    res.json({
      status: "success",
      message: "Chat history retrieved successfully.",
      data: chatHistory,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An internal server error occurred.",
      error: error.message,
    });
  }
};

const getAllChatHistories = async (req, res) => {
  try {
    // This should be an admin-only endpoint
    const chatHistories = await prisma.chatHistory.findMany({
      include: {
        details: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    res.json({
      status: "success",
      message: "Chat histories retrieved successfully.",
      data: chatHistories,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An internal server error occurred.",
      error: error.message,
    });
  }
};

const getChatHistoryByUser = async (req, res) => {
  const { userId } = req.user; // Assuming authenticateToken middleware adds user to req

  try {
    const userChatHistories = await prisma.chatHistory.findMany({
      where: { userId },
      include: {
        details: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!userChatHistories || userChatHistories.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No chat histories found for this user.",
      });
    }

    res.json({
      status: "success",
      message: "User chat histories retrieved successfully.",
      data: userChatHistories,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An internal server error occurred.",
      error: error.message,
    });
  }
};

module.exports = {
  startNewChat,
  continueChat,
  getChatHistoryBySlug,
  getAllChatHistories,
  getChatHistoryByUser,
};
