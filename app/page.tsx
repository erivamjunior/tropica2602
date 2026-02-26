"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import { AmplifyConfig } from "./components/amplify-config";
import Dashboard from "./components/dashboard";

export default function Home() {
  return (
    <>
      <AmplifyConfig />
      <Authenticator>
        {({ signOut, user }) => (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 16, background: "#0f172a", color: "#fff" }}>
              <span>Logado como: {user?.signInDetails?.loginId ?? user?.username}</span>
              <button style={{ width: "auto", background: "#ef4444" }} onClick={signOut}>Sair</button>
            </div>
            <Dashboard />
          </>
        )}
      </Authenticator>
    </>
  );
}
