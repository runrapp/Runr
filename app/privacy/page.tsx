import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-border">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Runr" className="h-6 w-6" />
            <span className="font-logo text-2xl tracking-tight text-ink">RUNR</span>
          </Link>
        </div>
      </nav>

      <article className="max-w-[720px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted mb-4">Legal</p>
        <h1 className="font-display text-[clamp(32px,6vw,56px)] leading-[0.95] tracking-display text-ink mb-4">PRIVACY POLICY</h1>
        <p className="font-mono text-sm text-muted mb-12">Last updated: March 19, 2026</p>

        <div className="space-y-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:tracking-display [&_h2]:text-ink [&_h2]:mb-3 [&_h2]:uppercase [&_p]:font-mono [&_p]:text-sm [&_p]:text-muted [&_p]:leading-relaxed [&_ul]:font-mono [&_ul]:text-sm [&_ul]:text-muted [&_ul]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
          <section>
            <h2>1. Information We Collect</h2>
            <p>When you use Runr, we collect:</p>
            <ul>
              <li>Account information (email address, password hash)</li>
              <li>Integration credentials (OAuth tokens for Gmail, Google Calendar; bot tokens for Telegram, Discord)</li>
              <li>Usage data (tasks executed, features used, timestamps)</li>
              <li>Device and browser information for security purposes</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and operate the Runr service</li>
              <li>Execute tasks on your behalf through connected integrations</li>
              <li>Improve and personalize your experience</li>
              <li>Send service-related communications</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2>3. Data Processing</h2>
            <p>When Runr executes tasks (reading emails, creating calendar events, sending messages), it processes the minimum data necessary to complete the task. We do not permanently store the content of your emails, messages, or calendar events beyond what is needed for immediate task execution.</p>
          </section>

          <section>
            <h2>4. Integration Credentials</h2>
            <p>Your OAuth tokens and bot tokens are encrypted at rest. We never share your integration credentials with third parties. You can disconnect any integration at any time from your dashboard, which immediately revokes our access.</p>
          </section>

          <section>
            <h2>5. Data Sharing</h2>
            <p>We do not sell, rent, or share your personal information with third parties except:</p>
            <ul>
              <li>With service providers who assist in operating Runr (hosting, analytics)</li>
              <li>When required by law or to protect our rights</li>
              <li>With your explicit consent</li>
            </ul>
          </section>

          <section>
            <h2>6. Data Retention</h2>
            <p>Task history is retained according to your plan (30 days for Starter, unlimited for Pro). Account data is retained while your account is active. Upon account deletion, we remove your data within 30 days.</p>
          </section>

          <section>
            <h2>7. Security</h2>
            <p>We use industry-standard security measures including encryption in transit (TLS), encryption at rest for credentials, and secure authentication via Supabase Auth. However, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section>
            <h2>8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Request correction or deletion of your data</li>
              <li>Disconnect integrations at any time</li>
              <li>Export your task history</li>
              <li>Delete your account</li>
            </ul>
          </section>

          <section>
            <h2>9. Contact</h2>
            <p>For privacy-related questions, contact us at <a href="mailto:runrapp69@gmail.com" className="text-ink underline hover:no-underline">runrapp69@gmail.com</a>.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <Link href="/" className="font-mono text-xs uppercase tracking-[2px] text-muted hover:text-ink transition-colors">← Back to home</Link>
        </div>
      </article>
    </main>
  )
}
