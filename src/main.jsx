import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ClerkProvider } from "@clerk/clerk-react";
import { esES } from "@clerk/localizations";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById("root")).render(
  <ClerkProvider
    publishableKey={clerkPubKey}
    localization={esES}
    afterSignInUrl="/home"
    afterSignUpUrl="/home"
    signInUrl="/"
    signUpUrl="/registro"
  >
    <App />
  </ClerkProvider>
);