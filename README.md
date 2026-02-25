# Tabib - AI Doctor Assistant 🏥

A Moroccan Arabic medical chatbot that uses **OpenAI's Responses API** with integrated medicine database to provide personalized medical guidance and medicine recommendations.

## 🌟 Features

- 🤖 **AI-powered medical consultations** in Moroccan Arabic (Darija)
- 💊 **Integrated Moroccan Medicine Database** with 5,432+ medicines
- 🔍 **Intelligent Medicine Search** using OpenAI function calling
- 🖼️ **Image upload support** for visual symptom analysis
- 💬 **Conversation continuity** with response tracking
- 📱 **WhatsApp sharing** integration
- 📋 **Copy-to-clipboard** functionality
- 🎨 **Modern, responsive UI**
- ⚡ **Future-proof** using OpenAI Responses API (migrated from deprecated Assistants API)

## 🚀 Setup

### 1. Environment Variables

Create a `.env.local` file in the root directory with your OpenAI API key:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

**Note:** The `.env.local` file is already created. Your API key is configured.

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📡 API Architecture

### Responses API Integration

The application now uses **OpenAI's Responses API** (future-proof, replaces deprecated Assistants API):

- **Endpoint**: `/api/assistant` (upgraded to use Responses API)
- **Model**: GPT-4o (best for function calling + vision)
- **Function Calling**: Integrated medicine database search
- **Conversation Management**: Client-side with `responseId` tracking

### Medicine Database

- **Location**: [tabib/data/morocco_medicines_pretty.json](tabib/data/morocco_medicines_pretty.json)
- **Size**: 5,432+ medicines
- **Fields**:
  - `nom_commercial` (commercial name)
  - `composition` (active ingredient)
  - `classe_therapeutique` (therapeutic class)
  - `indications` (medical indications)
  - `dosage`, `ppv` (public price), `prix_hospitalier` (hospital price)
  - `statut` (commercialization status)
  - `tableau` (prescription requirement)

### How It Works

```
User describes symptoms → AI analyzes → Calls search_medicine_database() →
Searches local database → Returns medicines → AI recommends with dosage & price
```

## 🛠️ Technical Implementation

### Function Calling Tool

The AI has access to `search_medicine_database()` function that can search by:
- **Symptoms** (e.g., "headache", "fever", "صداع")
- **Condition** (e.g., "diabetes", "hypertension", "السكري")
- **Composition** (e.g., "paracetamol", "amoxicillin")
- **Therapeutic Class** (e.g., "antibiotique", "antidiabétique")
- **Max Price** (optional price filter)

### Medicine Search Utility

Enhanced search in [utils/medicines.js](utils/medicines.js:28-116):
- Advanced filtering with relevance scoring
- Supports multiple search criteria
- Returns top-ranked results
- Formatted output for AI consumption

## 📝 API Endpoints

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/assistant` | POST | **Responses API** with medicine search | ✅ Active |
| `/api/diagnose` | POST | Legacy Chat Completions endpoint | 🔄 Available |
| `/api/test-openai` | GET | API connectivity test | ✅ Active |
| `/api/list-assistants` | GET | List available assistants | ✅ Active |

## 💡 Key Features Explained

### 1. Medicine Recommendations

The AI asks clarifying questions about:
- Patient age and gender
- Allergies
- Current medications
- Symptom duration

Then searches the database and recommends medicines with:
- Commercial name
- Dosage instructions
- Price (public & hospital)
- Prescription requirement
- Side effects warnings

### 2. Image Analysis

Upload images of:
- Skin conditions
- Rashes
- Injuries
- Medical documents

The AI analyzes using GPT-4o vision capabilities.

### 3. Emergency Detection

Automatically detects serious symptoms and recommends calling:
- **141** - Ambulance
- **150** - Gendarmerie
- **19** - Police

### 4. Conversation Continuity

Uses `responseId` to maintain conversation context without server-side state management.

## 🔐 Security & Privacy

- ✅ API key stored in `.env.local` (not committed)
- ✅ No user data persistence (GDPR compliant)
- ✅ Conversation stored client-side only
- ✅ Medicine database is local (no external calls)

## ⚠️ Important Disclaimers

- **Educational purposes only**
- **Not a substitute for professional medical advice**
- **Always consult a real doctor for serious conditions**
- Medicines marked "Tableau A" require a prescription
- Verify medicine availability with your pharmacist

## 🏗️ Technologies Used

- **Next.js 15.5.4** - React framework
- **React 18.2.0** - UI framework
- **OpenAI Responses API** - AI backend (GPT-4o)
- **Tailwind CSS 3.4.1** - Styling
- **Formidable 2.0.1** - File upload handling
- **Function Calling** - Medicine database integration

## 📚 Migration from Assistants API

This project was successfully migrated from the **deprecated Assistants API** (sunset: August 26, 2026) to the **Responses API**:

### Benefits of Migration:
✅ **Future-proof** - Won't be deprecated
✅ **Cost-effective** - No storage fees for conversation state
✅ **Faster** - No polling required
✅ **More control** - Direct function execution
✅ **Streaming support** - Can be added if needed

### Migration Details:
- Replaced thread-based state with response IDs
- Implemented function calling for medicine search
- Maintained backward compatibility with frontend
- Improved error handling and logging

## 🤝 Contributing

This is a medical application. Contributions should:
1. Maintain accuracy of medical information
2. Follow ethical guidelines
3. Respect user privacy
4. Include proper disclaimers

## 📄 License

ISC

## 🔗 Useful Links

- OpenAI Responses API: https://platform.openai.com/docs/guides/responses-api
- Medicine Database Source: medicament.ma
- Emergency Services Morocco: 141 (Ambulance) 