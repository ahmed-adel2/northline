"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AccessDenied() {
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    // Automatically sign out unauthorized user and redirect to home page
    const timer = setTimeout(async () => {
      try {
        await signOut({ redirectUrl: "/" });
      } catch {
        router.push("/");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [signOut, router]);

  const handleManualSignOut = async () => {
    await signOut({ redirectUrl: "/" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
        background: "var(--clinic-ground)",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "var(--clinic-radius-md)",
          background: "#fdeaea",
          display: "grid",
          placeItems: "center",
          fontSize: "1.75rem",
        }}
      >
        ⛔
      </div>
      <h1
        style={{
          margin: 0,
          fontSize: "1.5rem",
          fontWeight: 600,
          color: "var(--clinic-ink)",
        }}
      >
        Access Denied — Not Authorized
      </h1>
      <p
        style={{
          margin: 0,
          color: "var(--clinic-muted)",
          maxWidth: "26rem",
          fontSize: "0.9rem",
          lineHeight: 1.5,
        }}
      >
        Your account is not registered as a clinic administrator. You are being
        automatically signed out and redirected to the home page...
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "var(--clinic-muted)",
          fontSize: "0.82rem",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "14px",
            height: "14px",
            border: "2px solid var(--clinic-hairline)",
            borderTopColor: "var(--clinic-teal)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <span>Signing out and redirecting...</span>
      </div>

      <button
        type="button"
        onClick={handleManualSignOut}
        style={{
          marginTop: "0.5rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.55rem 1.25rem",
          borderRadius: "var(--clinic-radius-sm)",
          background: "var(--clinic-surface)",
          border: "1px solid var(--clinic-hairline)",
          color: "var(--clinic-ink)",
          cursor: "pointer",
          fontSize: "0.82rem",
          fontWeight: 550,
        }}
      >
        Return to Home Now
      </button>
    </div>
  );
}
