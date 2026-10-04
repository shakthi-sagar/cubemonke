import { useState } from 'react'
import { Mail, Send, CheckCircle2 } from 'lucide-react'

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Feedback', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return

    setLoading(true)
    setErrorMsg(null)

    try {
      const response = await fetch('https://formsubmit.co/ajax/support@cubemonke.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          Name: form.name,
          Email: form.email,
          Subject: form.subject,
          Message: form.message,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        setForm({ name: '', email: '', subject: 'Feedback', message: '' })
      } else {
        setErrorMsg('Failed to submit form. Please try again or email directly.')
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('A network error occurred. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col gap-6 p-4 md:p-6 pt-10 pb-16">
      {/* Header */}
      <div className="rounded-lg border border-border bg-card/40 p-6 md:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Get In Touch</span>
          <h1 className="text-3xl font-black tracking-tight">Contact</h1>
          <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
            Have questions, feedback, or a bug report? Reach out to us through our direct email or send a message below.
          </p>
        </div>
      </div>

      {/* Email Contact Card */}
      <a
        href="mailto:support@cubemonke.com"
        className="group rounded-lg border border-border bg-card/40 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Direct Email</h3>
            <p className="mt-0.5 text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors break-all">
              support@cubemonke.com
            </p>
          </div>
        </div>
        <span className="hidden sm:inline text-xs font-bold text-primary group-hover:underline">Send email &rarr;</span>
      </a>

      {/* Message Form */}
      <div className="rounded-lg border border-border bg-card/40 p-6 md:p-8 shadow-sm backdrop-blur-md">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/10 mb-4">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-black tracking-tight">Message Sent!</h2>
            <p className="mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
              Thank you for your message. We appreciate your feedback and will get back to you shortly.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-6 rounded-md border border-border bg-muted/40 hover:bg-muted px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground mb-1">
              Send a Message
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full rounded-md border border-border bg-background/50 px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground/60 transition-colors focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-border bg-background/50 px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground/60 transition-colors focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="subject" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Subject
              </label>
              <select
                id="subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-md border border-border bg-background/50 px-3.5 py-2.5 text-xs text-foreground transition-colors focus:border-primary focus:outline-none"
              >
                <option value="Feedback">Feedback & Suggestions</option>
                <option value="Bug">Bug Report</option>
                <option value="Account">Account Issues</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us what's on your mind..."
                className="w-full rounded-md border border-border bg-background/50 px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground/60 transition-colors focus:border-primary focus:outline-none resize-none"
              />
            </div>

            {errorMsg && (
              <div className="text-xs font-semibold text-destructive mt-1">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground py-3 text-xs font-bold shadow-lg shadow-primary/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Send Message
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ContactPage
