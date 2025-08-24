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

    // Test basic API connectivity
    const testResponse = await fetch("https://api.openai.com/v1/models", {
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    if (!testResponse.ok) {
      const errorData = await testResponse.text();
      return res.status(testResponse.status).json({
        error: 'API test failed',
        status: testResponse.status,
        statusText: testResponse.statusText,
        details: errorData
      });
    }

    const models = await testResponse.json();
    
    // Test assistant access
    const assistantResponse = await fetch(`https://api.openai.com/v1/assistants/asst_o84xT4LMe1ScdGPb8RmRnSAa`, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2"
      }
    });

    let assistantStatus = 'unknown';
    if (assistantResponse.ok) {
      assistantStatus = 'accessible';
    } else {
      assistantStatus = `error: ${assistantResponse.status}`;
    }

    res.status(200).json({
      success: true,
      message: 'OpenAI API is working correctly',
      apiKeyConfigured: true,
      modelsAvailable: models.data?.length || 0,
      assistantStatus: assistantStatus,
      availableModels: models.data?.slice(0, 5).map(m => m.id) || []
    });

  } catch (err) {
    console.error("Test API error:", err);
    res.status(500).json({
      error: 'Test failed',
      message: err.message
    });
  }
} 