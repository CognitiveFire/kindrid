# Kindrid - Secure AI-Powered School Photo Sharing Platform

A secure, AI-powered platform for sharing school photos and videos with full parental control at its core. Built with React, Vite, and Tailwind CSS.

## 🚀 Features

- **Secure Photo Sharing**: GDPR-compliant platform hosted in Norway
- **AI-Powered Processing**: ClassVault™ technology for identity masking and background restoration
- **Parental Controls**: Full consent management for every photo
- **Role-Based Access**: Separate teacher and parent views with appropriate permissions
- **Real-time Notifications**: Instant updates on photo status and consent changes
- **Cross-Platform**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom color palette

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🚀 Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd kindrid
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🌐 Deployment

### Railway Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Railway**
   - Go to [Railway](https://railway.app/)
   - Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your Kindrid repository

3. **Configure Build Settings**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Deploy**
   Railway will automatically build and deploy your app

### Environment Variables

No environment variables are required for basic functionality. The app uses mock data and services for demonstration purposes.

## 📁 Project Structure

```
kindrid/
├── public/                 # Static assets
│   ├── 1.jpg - 6.jpg     # Demo photos
│   ├── kindrid logo.png   # App logo
│   └── kindrid-icon.svg   # Favicon
├── src/
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts
│   ├── pages/            # Page components
│   ├── services/         # Mock services
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── package.json           # Dependencies and scripts
├── tailwind.config.cjs    # Tailwind configuration
└── vite.config.cjs        # Vite configuration
```

## 🎨 Customization

### Colors
The app uses a custom color palette defined in `tailwind.config.cjs`:
- Primary: `#23af93` (teal)
- Secondary: Various shades of teal and gray

### Adding New Features
- **New Pages**: Add routes in `src/App.jsx`
- **New Components**: Create in `src/components/`
- **New Services**: Add to `src/services/`

## 🔒 Security Features

- **Role-Based Access Control**: Teachers vs. Parents
- **Consent Management**: Granular photo permissions
- **AI Processing**: Identity masking for privacy
- **GDPR Compliance**: European data protection standards

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🧪 Testing

Currently uses mock data and services. For production:
- Replace mock services with real APIs
- Add authentication system
- Implement real AI processing
- Add database integration

## 📄 License

This project is proprietary software for Kindrid.

## 🤝 Contributing

This is a private project. Please contact the development team for contributions.

## 📞 Support

For support or questions, please contact the Kindrid development team.

---

**Built with ❤️ for secure school photo sharing**
