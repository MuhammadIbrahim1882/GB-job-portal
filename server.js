const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));

const jobs = [
  {
    id: 'job-101',
    title: 'Senior Full Stack Developer',
    company: 'GB Tech Labs',
    location: 'Lahore',
    type: 'Full-time',
    category: 'Software Development',
    salary: '$2,500 - $3,200 / month',
    experience: '3+ years',
    postedAt: '2 days ago',
    description:
      'We are looking for a full-stack developer to design, build, and improve web applications used by thousands of customers every day.',
    requirements: [
      'Strong JavaScript and Node.js experience',
      'Proficiency in React and backend APIs',
      'Experience with PostgreSQL and RESTful services',
      'Excellent communication and teamwork skills'
    ]
  },
  {
    id: 'job-102',
    title: 'Product Designer',
    company: 'BluePeak Studio',
    location: 'Remote',
    type: 'Remote',
    category: 'Design',
    salary: '$2,000 - $2,800 / month',
    experience: '2+ years',
    postedAt: '1 day ago',
    description:
      'Shape intuitive user experiences with a strong design system, user research, and collaborative product thinking.',
    requirements: [
      'Portfolio showing UI/UX work',
      'Figma and prototyping expertise',
      'Understanding of accessibility best practices',
      'Ability to work with developers in agile teams'
    ]
  },
  {
    id: 'job-103',
    title: 'Data Analyst',
    company: 'Insight Matrix',
    location: 'Karachi',
    type: 'Full-time',
    category: 'Analytics',
    salary: '$1,800 - $2,400 / month',
    experience: '1+ years',
    postedAt: '4 days ago',
    description:
      'Use dashboards, analysis, and business insights to help teams make smarter product and operations decisions.',
    requirements: [
      'SQL and Excel proficiency',
      'Experience with BI tools such as Power BI or Tableau',
      'Strong analytical thinking',
      'Business communication skills'
    ]
  },
  {
    id: 'job-104',
    title: 'Frontend Engineer',
    company: 'Nova Commerce',
    location: 'Islamabad',
    type: 'Contract',
    category: 'Software Development',
    salary: '$1,600 - $2,300 / month',
    experience: '2+ years',
    postedAt: '3 days ago',
    description:
      'Build accessible, performance-focused front-end experiences for a fast-growing e-commerce platform.',
    requirements: [
      'React, TypeScript, and CSS expertise',
      'Strong component architecture skills',
      'Experience with responsive design',
      'Optimization and debugging mindset'
    ]
  },
  {
    id: 'job-105',
    title: 'Customer Success Manager',
    company: 'Orbit Partners',
    location: 'Hybrid',
    type: 'Full-time',
    category: 'Customer Support',
    salary: '$1,500 - $2,100 / month',
    experience: '1+ years',
    postedAt: 'Today',
    description:
      'Support enterprise customers by helping them onboard, adopt, and expand their usage of the platform.',
    requirements: [
      'Excellent relationship management',
      'Customer-facing experience in SaaS',
      'Strong communication and problem solving',
      'Comfort with reporting and issue tracking'
    ]
  }
];

const applications = [];

function getNormalizedRequirements(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'GB Job Portal',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/jobs', (req, res) => {
  const { search = '', location = 'all', type = 'all', category = 'all', experience = 'all' } = req.query;
  const query = String(search).trim().toLowerCase();

  let filteredJobs = jobs.filter((job) => {
    const matchesSearch = !query || [job.title, job.company, job.location, job.category, job.description]
      .join(' ')
      .toLowerCase()
      .includes(query);

    const matchesLocation = location === 'all' || job.location === location;
    const matchesType = type === 'all' || job.type === type;
    const matchesCategory = category === 'all' || job.category === category;

    const matchesExperience = experience === 'all' || job.experience === experience;

    return matchesSearch && matchesLocation && matchesType && matchesCategory && matchesExperience;
  });

  res.json(filteredJobs);
});

app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.find((item) => item.id === req.params.id);

  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  return res.json(job);
});

app.post('/api/jobs', (req, res) => {
  const { title, company, location, type, category, salary, experience, description, requirements } = req.body;

  if (!title || !company || !location || !type || !category || !description) {
    return res.status(400).json({ message: 'Please fill in the required job fields.' });
  }

  const newJob = {
    id: `job-${Date.now()}`,
    title: String(title).trim(),
    company: String(company).trim(),
    location: String(location).trim(),
    type: String(type).trim(),
    category: String(category).trim(),
    salary: String(salary || 'Negotiable').trim(),
    experience: String(experience || 'Any experience').trim(),
    postedAt: 'Just now',
    description: String(description).trim(),
    requirements: getNormalizedRequirements(requirements)
  };

  jobs.unshift(newJob);
  return res.status(201).json(newJob);
});

app.post('/api/applications', (req, res) => {
  const { jobId, name, email, phone, portfolio, coverLetter } = req.body;

  if (!jobId || !name || !email || !coverLetter) {
    return res.status(400).json({ message: 'Please complete the required application fields.' });
  }

  const job = jobs.find((item) => item.id === jobId);
  if (!job) {
    return res.status(404).json({ message: 'Selected job was not found.' });
  }

  const application = {
    id: `app-${Date.now()}`,
    jobId,
    jobTitle: job.title,
    name: String(name).trim(),
    email: String(email).trim(),
    phone: String(phone || '').trim(),
    portfolio: String(portfolio || '').trim(),
    coverLetter: String(coverLetter).trim(),
    appliedAt: new Date().toISOString()
  };

  applications.push(application);

  return res.status(201).json({
    message: `Application sent successfully for ${job.title}.`,
    application
  });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`GB Job Portal running at http://localhost:${PORT}`);
  });
}

module.exports = { app, jobs, applications };
