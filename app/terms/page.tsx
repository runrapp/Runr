import Link from 'next/link'

export default function TermsPage() {
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
        <h1 className="font-display text-[clamp(32px,6vw,56px)] leading-[0.95] tracking-display text-ink mb-4">TERMS OF SERVICE</h1>
        <p className="font-mono text-sm text-muted mb-12">Last updated: March 19, 2026</p>

        <div className="space-y-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:tracking-display [&_h2]:text-ink [&_h2]:mb-3 [&_h2]:uppercase [&_p]:font-mono [&_p]:text-sm [&_p]:text-muted [&_p]:leading-relaxed [&_ul]:font-mono [&_ul]:text-sm [&_ul]:text-muted [&_ul]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using Runr ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.</p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>Runr is an AI-powered agent that executes tasks on your behalf by connecting to third-party services including Gmail, Google Calendar, Telegram, and Discord. The Service requires active integration connections and a valid subscription to function.</p>
          </section>

          <section>
            <h2>3. Account Registration</h2>
            <p>You must provide a valid email address and create a password to use Runr. You are responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2>4. Subscriptions & Payment</h2>
            <p>Runr offers paid subscription plans billed monthly through Lemon Squeezy. By subscribing, you agree to:</p>
            <ul>
              <li>Pay the applicable fees for your chosen plan</li>
              <li>Automatic recurring billing until you cancel</li>
              <li>Plan limitations (task quotas, integration limits) as described on our pricing page</li>
            </ul>
          </section>

          <section>
            <h2>5. Cancellation & Refunds</h2>
            <p>You may cancel your subscription at any time. Upon cancellation:</p>
            <ul>
              <li>Your subscription remains active until the end of the current billing period</li>
              <li>No partial refunds are issued for unused time</li>
              <li>Your integrations will be disconnected and task execution will stop</li>
            </ul>
          </section>

          <section>
            <h2>6. Acceptable Use</h2>
            <p>You agree not to use Runr to:</p>
            <ul>
              <li>Send spam or unsolicited messages through any integration</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to access accounts or data belonging to other users</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use the Service for any illegal or harmful purpose</li>
            </ul>
          </section>

          <section>
            <h2>7. Third-Party Services</h2>
            <p>Runr connects to third-party services (Google, Telegram, Discord). Your use of these services through Runr is also subject to their respective terms of service and privacy policies. We are not responsible for the availability, security, or policies of third-party services.</p>
          </section>

          <section>
            <h2>8. Limitation of Liability</h2>
            <p>Runr is provided "as is" without warranties of any kind. We are not liable for:</p>
            <ul>
              <li>Actions taken by the AI agent on your behalf (emails sent, events created, messages posted)</li>
              <li>Data loss resulting from integration failures or service outages</li>
              <li>Indirect, incidental, or consequential damages</li>
            </ul>
            <p>You acknowledge that AI-executed tasks may occasionally produce errors, and you are responsible for reviewing important actions.</p>
          </section>

          <section>
            <h2>9. Modifications</h2>
            <p>We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated date. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2>10. Termination</h2>
            <p>We may suspend or terminate your account if you violate these terms or engage in abusive behavior. Upon termination, your right to use the Service ceases immediately.</p>
          </section>

          <section>
            <h2>11. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:support@runr.site" className="text-ink underline hover:no-underline">support@runr.site</a>.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <Link href="/" className="font-mono text-xs uppercase tracking-[2px] text-muted hover:text-ink transition-colors">← Back to home</Link>
        </div>
      </article>
    </main>
  )
}
