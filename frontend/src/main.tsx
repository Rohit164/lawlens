import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

// Import your Clerk Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env.local file')
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#9333ea", // Purple-600
          colorBackground: "#0f172a", // Slate-900
          colorInputBackground: "#1e293b", // Slate-800
          colorInputText: "#f1f5f9", // Slate-100
          colorText: "#f1f5f9", // Slate-100
          colorTextSecondary: "#94a3b8", // Slate-400
          colorSuccess: "#10b981", // Emerald-500
          colorDanger: "#ef4444", // Red-500
          colorWarning: "#f59e0b", // Amber-500
          colorNeutral: "#64748b", // Slate-500
          fontFamily: '"Inter", sans-serif',
          fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
          },
          borderRadius: "0.75rem", // Rounded-xl
          spacingUnit: "1rem",
        },
        elements: {
          // Main card styling
          card: {
            backgroundColor: "rgba(30, 41, 59, 0.8)", // Slate-800 with transparency
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(148, 163, 184, 0.2)", // Slate-400 with transparency
            borderRadius: "1rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          },
          
          // Header styling
          headerTitle: {
            color: "#f1f5f9", // Slate-100
            fontSize: "1.875rem", // text-3xl
            fontWeight: "700",
            textAlign: "center",
          },
          
          headerSubtitle: {
            color: "#94a3b8", // Slate-400
            fontSize: "1rem",
            textAlign: "center",
          },
          
          // Form elements
          formFieldInput: {
            backgroundColor: "rgba(15, 23, 42, 0.8)", // Slate-900 with transparency
            border: "1px solid rgba(71, 85, 105, 0.5)", // Slate-600 with transparency
            borderRadius: "0.5rem",
            color: "#f1f5f9", // Slate-100
            fontSize: "1rem",
            padding: "0.75rem 1rem",
            transition: "all 0.2s ease-in-out",
            "&:focus": {
              borderColor: "#9333ea", // Purple-600
              boxShadow: "0 0 0 3px rgba(147, 51, 234, 0.1)",
              outline: "none",
            },
            "&::placeholder": {
              color: "#64748b", // Slate-500
            },
          },
          
          formFieldLabel: {
            color: "#e2e8f0", // Slate-200
            fontSize: "0.875rem",
            fontWeight: "500",
            marginBottom: "0.5rem",
          },
          
          // Buttons
          formButtonPrimary: {
            backgroundColor: "#9333ea", // Purple-600
            border: "none",
            borderRadius: "0.5rem",
            color: "#ffffff",
            fontSize: "1rem",
            fontWeight: "600",
            padding: "0.75rem 1.5rem",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "#7c3aed", // Purple-700
              transform: "translateY(-1px)",
              boxShadow: "0 10px 25px -5px rgba(147, 51, 234, 0.4)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          },
          
          // Social buttons
          socialButtonsBlockButton: {
            backgroundColor: "rgba(30, 41, 59, 0.8)", // Slate-800 with transparency
            border: "1px solid rgba(71, 85, 105, 0.5)", // Slate-600 with transparency
            borderRadius: "0.5rem",
            color: "#f1f5f9", // Slate-100
            fontSize: "1rem",
            fontWeight: "500",
            padding: "0.75rem 1rem",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "rgba(51, 65, 85, 0.8)", // Slate-700 with transparency
              borderColor: "#9333ea", // Purple-600
              transform: "translateY(-1px)",
            },
          },
          
          // Links
          footerActionLink: {
            color: "#9333ea", // Purple-600
            fontSize: "0.875rem",
            fontWeight: "500",
            textDecoration: "none",
            "&:hover": {
              color: "#7c3aed", // Purple-700
              textDecoration: "underline",
            },
          },
          
          // Divider
          dividerLine: {
            backgroundColor: "rgba(71, 85, 105, 0.3)", // Slate-600 with transparency
          },
          
          dividerText: {
            color: "#94a3b8", // Slate-400
            fontSize: "0.875rem",
          },
          
          // Footer
          footerActionText: {
            color: "#94a3b8", // Slate-400
            fontSize: "0.875rem",
          },
          
          // Error messages
          formFieldErrorText: {
            color: "#ef4444", // Red-500
            fontSize: "0.875rem",
            marginTop: "0.25rem",
          },
          
          // Loading spinner
          spinner: {
            color: "#9333ea", // Purple-600
          },
          
          // Modal backdrop
          modalBackdrop: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
          },
          
          // Close button
          modalCloseButton: {
            color: "#94a3b8", // Slate-400
            "&:hover": {
              color: "#f1f5f9", // Slate-100
            },
          },
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);
