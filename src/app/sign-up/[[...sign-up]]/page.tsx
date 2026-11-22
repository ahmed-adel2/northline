import { SignUp } from "@clerk/nextjs";

export default function Page() {
    return (
        <>
            <div className="auth-page">
                <div className="auth-brand">
                    <span className="auth-mark">DR</span>
                    <span className="auth-clinic-name">Northline Dental Clinic</span>
                </div>
                <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />;
                
                <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          background: var(--clinic-ground);
          padding: 2rem;
        }
        .auth-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          text-align: center;
        }
        .auth-mark {
          display: grid;
          width: 3rem;
          height: 3rem;
          place-items: center;
          border-radius: var(--clinic-radius-md);
          background: var(--clinic-teal);
          color: #fff;
          font-family: var(--font-geist-mono), monospace;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .auth-clinic-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--clinic-ink);
          letter-spacing: -0.02em;
        }
        .clerk-card {
          background: var(--clinic-surface) !important;
          border: 1px solid var(--clinic-hairline) !important;
          border-radius: var(--clinic-radius-md) !important;
          box-shadow: none !important;
        }
      `}</style>
            </div>
        </>
    )
}
