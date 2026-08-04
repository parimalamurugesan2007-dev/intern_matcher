// Static content used ONLY by the landing page (marketing). The dashboard,
// profile, recommendations, skill-gap, and roadmap pages are all built from
// the real /recommend response — no demo data there.

export const companies = ['Google', 'Microsoft', 'Amazon', 'Infosys', 'Zoho', 'TCS', 'Accenture'];

export const testimonials = [
  {
    name: 'Priya Nair',
    role: 'CS Student, NIT Trichy',
    quote: 'I got matched to a Google internship within two weeks. The skill-gap analysis told me exactly what to learn next.',
    avatar: 'https://i.pravatar.cc/120?img=47',
  },
  {
    name: 'Rahul Verma',
    role: 'Software Engineering Intern, Microsoft',
    quote: 'The ATS resume score helped me rewrite my resume and triple my interview callbacks. Genuinely a game changer.',
    avatar: 'https://i.pravatar.cc/120?img=12',
  },
  {
    name: 'Sneha Reddy',
    role: 'Data Science Intern, Amazon',
    quote: 'The learning roadmap is unreal. It broke down six months of prep into a clear weekly plan I actually followed.',
    avatar: 'https://i.pravatar.cc/120?img=32',
  },
];

export const stats = [
  { label: 'Internships Matched', value: 12400, suffix: '+' },
  { label: 'Active Students', value: 3800, suffix: '+' },
  { label: 'Partner Companies', value: 320, suffix: '+' },
  { label: 'Avg. Match Accuracy', value: 92, suffix: '%' },
];
