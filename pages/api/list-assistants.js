export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'API key missing',
        message: 'OpenAI API key is not configured in environment variables'
      });
    }

    // List all assistants
    const assistantsResponse = await fetch("https://api.openai.com/v1/assistants", {
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2"
      }
    });

    if (!assistantsResponse.ok) {
      const errorData = await assistantsResponse.text();
      return res.status(assistantsResponse.status).json({
        error: 'Failed to fetch assistants',
        status: assistantsResponse.status,
        statusText: assistantsResponse.statusText,
        details: errorData
      });
    }

    const assistants = await assistantsResponse.json();
    
    res.status(200).json({
      success: true,
      message: 'Assistants retrieved successfully',
      totalAssistants: assistants.data?.length || 0,
      assistants: assistants.data?.map(assistant => ({
        id: assistant.id,
        name: assistant.name,
        description: assistant.description,
        model: assistant.model,
        created_at: assistant.created_at
      })) || []
    });

  } catch (err) {
    console.error("List assistants error:", err);
    res.status(500).json({
      error: 'Failed to list assistants',
      message: err.message
    });
  }
} 