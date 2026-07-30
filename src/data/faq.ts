export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: "General" | "Billing" | "Courses" | "Certificates";
}

export const faq: FaqItem[] = [
  {
    id: 1,
    category: "General",
    question: "What is Akilix?",
    answer:
      "Akilix is a premium educational platform offering 10,000+ expert-led courses, hands-on projects, and career-focused learning paths across development, data science, design, business, AI, and more.",
  },
  {
    id: 2,
    category: "Courses",
    question: "Do I keep lifetime access to courses I purchase?",
    answer:
      "Yes. For any individual course you buy, you get lifetime access and all future instructor updates included.",
  },
  {
    id: 3,
    category: "Billing",
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely. You can cancel at any moment from your account settings. You'll keep access until the end of your current billing cycle.",
  },
  {
    id: 4,
    category: "Certificates",
    question: "Do certificates count for college or employer credit?",
    answer:
      "Many of our partner programs offer formal credit. All Akilix certificates are shareable, verifiable, and trusted by 2,500+ hiring partners on our network.",
  },
  {
    id: 5,
    category: "Billing",
    question: "What's your refund policy?",
    answer:
      "We offer a 30-day money-back guarantee on most purchases. If you're not satisfied, contact support within 30 days for a full refund.",
  },
  {
    id: 6,
    category: "Courses",
    question: "Can I learn offline?",
    answer:
      "Yes. Akilix Plus and Teams members can download lectures and course materials for offline viewing on iOS, Android, and desktop apps.",
  },
];
