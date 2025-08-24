import { IncomingForm } from "formidable";
import fs from "fs/promises";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing");
      return res.status(500).json({ result: "❌ خطأ: مفتاح API مفقود. يرجى التحقق من إعدادات البيئة." });
    }

    const form = new IncomingForm({ maxFileSize: 50 * 1024 * 1024 });
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, flds, fls) => err ? reject(err) : resolve({ fields: flds, files: fls }));
    });

    const messages = JSON.parse(fields.messages || "[]");
    const threadId = fields.threadId || null;

    // Create or get thread
    let currentThreadId = threadId;
    if (!currentThreadId) {
      console.log("Creating new thread...");
      
      const threadResponse = await fetch("https://api.openai.com/v1/threads", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2"
        }
      });

      console.log("Thread creation response status:", threadResponse.status);
      
      if (!threadResponse.ok) {
        const errorData = await threadResponse.text();
        console.error("Thread creation failed:", {
          status: threadResponse.status,
          statusText: threadResponse.statusText,
          error: errorData
        });
        
        if (threadResponse.status === 401) {
          throw new Error('مفتاح API غير صالح أو منتهي الصلاحية');
        } else if (threadResponse.status === 429) {
          throw new Error('تم تجاوز حد الطلبات. يرجى المحاولة لاحقاً');
        } else if (threadResponse.status === 500) {
          throw new Error('خطأ في خادم OpenAI. يرجى المحاولة لاحقاً');
        } else {
          throw new Error(`فشل في إنشاء المحادثة: ${threadResponse.status} ${threadResponse.statusText}`);
        }
      }

      const threadData = await threadResponse.json();
      currentThreadId = threadData.id;
      console.log("Thread created successfully:", currentThreadId);
    }

    // Prepare the message content
    let messageContent = [];
    
    // Add text content if present (get the latest user message)
    const latestMessage = messages[messages.length - 1];
    if (latestMessage?.content) {
      messageContent.push({
        type: "text",
        text: latestMessage.content
      });
    }

    // Add image if present
    if (files.image) {
      try {
        const buffer = await fs.readFile(files.image.filepath);
        const base64Image = buffer.toString("base64");
        
        // Clean up the temporary file
        await fs.unlink(files.image.filepath).catch(console.error);
        
        messageContent.push({
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`
          }
        });
      } catch (error) {
        console.error("Image processing error:", error);
        if (files.image?.filepath) {
          await fs.unlink(files.image.filepath).catch(console.error);
        }
        return res.status(500).json({ result: "❌ خطأ في معالجة الصورة" });
      }
    }

    // Add message to thread
    console.log("Adding message to thread:", currentThreadId);
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({
        role: "user",
        content: messageContent
      })
    });

    if (!messageResponse.ok) {
      const errorData = await messageResponse.text();
      console.error("Failed to add message:", {
        status: messageResponse.status,
        statusText: messageResponse.statusText,
        error: errorData
      });
      throw new Error('فشل في إضافة الرسالة إلى المحادثة');
    }

    // Run the assistant
    console.log("Starting assistant run...");
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({
        assistant_id: "asst_o84xT4LMe1ScdGPb8RmRnSAa"
      })
    });

    if (!runResponse.ok) {
      const errorData = await runResponse.text();
      console.error("Failed to start assistant run:", {
        status: runResponse.status,
        statusText: runResponse.statusText,
        error: errorData
      });
      throw new Error('فشل في بدء تشغيل المساعد');
    }

    const runData = await runResponse.json();
    const runId = runData.id;
    console.log("Assistant run started:", runId);

    // Poll for completion
    let runStatus = "queued";
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals

    while (runStatus !== "completed" && runStatus !== "failed" && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}`, {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v2"
        }
      });

      if (!statusResponse.ok) {
        throw new Error('فشل في التحقق من حالة التشغيل');
      }

      const statusData = await statusResponse.json();
      runStatus = statusData.status;
      attempts++;
      console.log(`Run status (attempt ${attempts}):`, runStatus);

      if (runStatus === "requires_action") {
        // Handle any required actions (like tool calls)
        console.log("Run requires action:", statusData);
        break;
      }
    }

    // If run failed, still try to fetch the latest assistant message
    if (runStatus !== "completed") {
      console.warn(`Run did not complete successfully (status: ${runStatus}). Attempting to fetch latest assistant message anyway.`);
    }

    // Get the assistant's response
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2"
      }
    });

    if (!messagesResponse.ok) {
      throw new Error('فشل في استرجاع الرسائل');
    }

    const messagesData = await messagesResponse.json();
    
    // Get the latest assistant message (most recent)
    const assistantMessages = messagesData.data
      .filter(msg => msg.role === "assistant")
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort by newest first
    
    const latestAssistantMessage = assistantMessages[0];

    if (!latestAssistantMessage) {
      throw new Error('لم يتم العثور على رد من المساعد');
    }

    // Extract text content from the latest assistant response only
    let assistantContent = "";
    if (Array.isArray(latestAssistantMessage.content)) {
      latestAssistantMessage.content.forEach(content => {
        if (content.type === "text") {
          assistantContent += content.text.value;
        }
      });
    }

    console.log("Assistant response received successfully");
    res.status(200).json({ 
      result: assistantContent,
      threadId: currentThreadId
    });

  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ result: `❌ خطأ في الخادم الداخلي: ${err.message}` });
  }
} 