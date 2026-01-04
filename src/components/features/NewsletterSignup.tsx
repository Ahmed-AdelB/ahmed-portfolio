import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address.");

export const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const isSubscribed = localStorage.getItem("newsletter_subscribed");
    if (isSubscribed) {
      setIsVisible(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consent) {
      setStatus("error");
      setMessage("Please agree to the privacy policy.");
      return;
    }

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setStatus("error");
      setMessage(result.error.errors[0].message);
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.message);
        localStorage.setItem("newsletter_subscribed", "true");
        setTimeout(() => setIsVisible(false), 3000);
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  if (!isVisible && status === "idle") return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative overflow-hidden rounded-xl border border-green-900/50 bg-black/80 p-6 backdrop-blur-md shadow-[0_0_15px_rgba(0,255,65,0.1)] max-w-md mx-auto"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,65,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shine_4s_linear_infinite] pointer-events-none" />
          
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-green-400 mb-2 font-mono flex items-center gap-2">
              <span className="inline-block w-2 h-4 bg-green-500 animate-pulse" />
              NEWSLETTER_SIGNUP
            </h3>
            <p className="text-green-300/80 text-sm mb-6 font-mono">
              Join the network. Get the latest security research and Python protocols delivered encrypted to your inbox.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter_email_address..."
                  disabled={status === "loading" || status === "success"}
                  className="w-full bg-black/50 border border-green-800 rounded-md px-4 py-3 text-green-400 placeholder-green-800/50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono transition-colors disabled:opacity-50"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  disabled={status === "loading" || status === "success"}
                  className="mt-1 h-4 w-4 rounded border-green-800 bg-black/50 text-green-500 focus:ring-green-500/50 focus:ring-offset-0"
                />
                <label htmlFor="consent" className="text-xs text-green-300/60 cursor-pointer select-none font-mono">
                  I agree to process my data for the newsletter. Unsubscribe at any time. No spam, purely signals.
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={status === "loading" || status === "success" || !consent}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-md font-mono font-bold transition-all ${
                  status === "success"
                    ? "bg-green-600 text-black border border-green-500"
                    : "bg-green-900/30 text-green-400 border border-green-600 hover:bg-green-800/50 hover:text-green-300 hover:shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {status === "loading" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : status === "success" ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>SUBSCRIBED</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>INITIALIZE_SUBSCRIPTION</span>
                  </>
                )}
              </motion.button>
            </form>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mt-4 flex items-center gap-2 text-xs font-mono p-2 rounded ${
                    status === "error" ? "bg-red-900/20 text-red-400 border border-red-900/50" : "bg-green-900/20 text-green-400 border border-green-900/50"
                  }`}
                >
                  {status === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  {message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewsletterSignup;
