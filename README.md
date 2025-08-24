# Tabib - AI Doctor Assistant

A Moroccan Arabic medical chatbot that uses OpenAI's Assistant API to provide medical guidance and consultations.

## Features

- 🤖 AI-powered medical consultations in Moroccan Arabic (Darija)
- 🖼️ Image upload support for visual symptom analysis
- 💬 Conversation continuity with thread management
- 📱 WhatsApp sharing integration
- 📋 Copy-to-clipboard functionality
- 🎨 Modern, responsive UI

## Setup

### 1. Environment Variables

Create a `.env.local` file in the root directory with your OpenAI API key:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## API Endpoints

- `/api/assistant` - Main endpoint using OpenAI Assistant API
- `/api/diagnose` - Legacy endpoint using OpenAI Chat Completions API

## Assistant Configuration

The application is configured to use the OpenAI Assistant with ID: `asst_o84xT4LMe1ScdGPb8RmRnSAa`

## Features

- **Thread Management**: Conversations are maintained across sessions using OpenAI's thread system
- **Image Analysis**: Upload images for visual symptom analysis
- **Multi-language Support**: Responds in Moroccan Arabic (Darija) with French medical terms
- **Local Context**: Includes Moroccan pharmacy and doctor information
- **Emergency Alerts**: Automatically detects and alerts for serious symptoms

## Usage

1. Start a conversation by describing your symptoms
2. Upload images if needed for visual analysis
3. Share responses via WhatsApp or copy to clipboard
4. Continue the conversation for follow-up questions

## Important Notes

- This is for educational purposes only
- Not a substitute for professional medical advice
- Always consult a real doctor for serious conditions
- Emergency numbers: 141 (Ambulance), 150 (Gendarmerie), 19 (Police)

## Technologies Used

- Next.js
- React
- OpenAI Assistant API
- Tailwind CSS
- Formidable (file upload handling) 