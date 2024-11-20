# Captain's Log - A Personal AI Transcription Logbook

<p align="center">
  <img src="https://i.imgur.com/bv9e7IP.png" alt="Captain's Log Logo"/>
</p>

**Captain's Log** is your personal AI-powered voice transcription logbook. This innovative web application allows you to transcribe spoken words into text, organize your thoughts, and manage important notes. Built with cutting-edge technology and creative design, Captain's Log sets sail to revolutionize how you capture and manage ideas.

---

## 🚀 Deploy with One Click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/xi-rick/captains-log)

## 🛠️ Configuration

### Prerequisites

1. **Node.js** : Install the latest LTS version from [nodejs.org](https://nodejs.org/) .

2. **MongoDB Atlas** : Set up a cloud-based MongoDB database with [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) .

3. **Google Cloud Console** : Set up Google OAuth credentials for authentication.

4. **OpenAI API** : Obtain an API key for transcription services.

### Environment Variables

Create a `.env.local` file in your project root and set the following variables:

```plaintext
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
NEXTAUTH_SECRET=LONG_RANDOM_VALUE
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_OPENAI_API_KEY=YOUR_OPENAI_API_KEY
NEXT_PUBLIC_ALLOWED_EMAIL=YOUR_ALLOWED_EMAIL
```

### Step 1: Set Up MongoDB Atlas

1. Sign up for [MongoDB Atlas](https://mongodb.com/atlas) .

2. Create a new cluster and database.

3. In the Atlas dashboard, click **Connect** and follow the steps to get your MongoDB connection string.

4. Replace `YOUR_MONGODB_CONNECTION_STRING` in `.env.local` with your connection string.

5. Your MongoDB connection string should be in the following format:

```bash
mongodb+srv://username:password@clusterName.jrf8uup.mongodb.net/collectionName?retryWrites=true&w=majority&appName=clusterName
```

### Step 2: Configure Google Cloud OAuth

1. Visit the [Google Cloud Console](https://console.cloud.google.com) .

2. Create a new project and enable the **Google People API** .

3. Navigate to **APIs & Services > Credentials** and create OAuth 2.0 credentials.

4. Set the **Authorized Redirect URIs** to `http://localhost:3000/api/auth/callback/google`.

5. Note the **Client ID** and **Client Secret** .

6. Update `app/api/auth/[...nextauth]route.ts` to include Google as a provider:

```typescript
import GoogleProvider from 'next-auth/providers/google';

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
],
```

1. Add the following to your `.env.local` file:

```plaintext
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

### Step 3: Set Up OpenAI API

1. Sign up for [OpenAI](https://platform.openai.com/) .

2. Obtain your API key from the OpenAI dashboard.

3. Add the key to `.env.local`:

```plaintext
NEXT_PUBLIC_OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

### Step 4: Configure Allowed Email

Restrict access to specific email addresses:

```plaintext
NEXT_PUBLIC_ALLOWED_EMAIL=allowed@example.com
```

### Step 5: Set Up NEXTAUTH_SECRET

1. Run the following command to generate a random secret and automatically add it to your .env.local file:

```bash
npx auth secret
```

2. Check .env.local:

```bash
NEXTAUTH_SECRET=YOUR_RANDOM_SECRET
```

---

## 🚀 Deployment

### Local Development

1. Install dependencies:

```bash
npm install
```

2. Run the app in development mode:

```bash
npm run dev
```

The app will be accessible at `http://localhost:3000`.

### Production Deployment

1. Build the app:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

### Cloud Deployment with Vercel

1. Sign up for [Vercel](https://vercel.com/) .

2. Import your repository.

3. Add your environment variables in the **Settings > Environment Variables** section.

4. Deploy the app with a single click.

---

## 🌌 Features

- **Voice Transcription** : Leverage OpenAI's AI for seamless voice-to-text conversion.

- **Intuitive Interface** : Built with **shadcn/ui** for a sleek user experience.

- **Secure Authentication** : Powered by **NextAuth** and Google OAuth.

- **Persistent Storage** : Store data securely with MongoDB Atlas.

- **Customizable** : Easily adapt themes and functionality.

- **PWA Ready** : Offline functionality using **Next.js PWA** .

---

## 🌟 Contribution

We welcome contributions! Follow these steps to contribute:

1. Fork the repository and clone it locally:

```bash
git clone https://github.com/xi-Rick/captains-log.git
```

2. Create a new branch:

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes:

```bash
git commit -m "Add feature: your-feature-description"
```

4. Push your changes:

```bash
git push origin feature/your-feature-name
```

5. Submit a pull request on the main repository.

---

## 📜 License

This project is licensed under the [MIT License]() .

---

**Captain's Log** - Your journey, your stories, the galaxy awaits.
