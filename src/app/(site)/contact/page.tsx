"use client";

import { useState } from "react";
import { Mail, Phone, Clock, MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

const CONTACT_DETAILS = [
  { icon: Mail, label: "Email", value: "support@toystore.dev" },
  { icon: Phone, label: "Phone", value: "+91 90000 00000" },
  { icon: Clock, label: "Business Hours", value: "Mon – Sat, 9:00 AM – 7:00 PM IST" },
  { icon: MapPin, label: "Registered Office", value: "ToyStore Retail Pvt. Ltd., 4th Floor, Prestige Tech Park, Kadubeesanahalli, Bengaluru, Karnataka 560103, India" },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      showToast("Thanks! We'll get back to you within 24 hours.", "success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setSending(false);
    }, 600);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Contact Us" }]} />

      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 sm:text-3xl">Contact Us</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
        Have a question about an order, a product, or just want to say hello? Our support team is happy to help.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {CONTACT_DETAILS.map((c) => (
          <div key={c.label} className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
            <c.icon size={18} className="mt-0.5 shrink-0 text-primary-500" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{c.label}</p>
              <p className="mt-0.5 text-sm text-ink-700">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900 sm:text-xl">Send Us a Message</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <Input label="Subject" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this about?" />
          <Textarea
            label="Message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us how we can help..."
          />
          <Button type="submit" variant="primary" loading={sending}>
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
