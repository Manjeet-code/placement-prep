const Interview = require('../models/Interview');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-flash'
];

const COMPANY_PROFILES = {
  google: {
    name: 'Google',
    style: 'DSA heavy with emphasis on optimal solutions, System Design for senior roles, and Googleyness/Leadership questions. Focus on time and space complexity. Expect follow-up questions to optimize your solution further.',
    rounds: {
      technical: 'Focus on arrays, strings, trees, graphs, dynamic programming. Always ask for time/space complexity. Push candidate to optimize.',
      system_design: 'Design scalable systems like Google Search, YouTube, Maps. Focus on scale, availability, consistency.',
      hr: 'Googleyness culture fit — ask about ambiguity handling, collaboration, innovation, and passion for technology.'
    },
    tips: 'Focus on technical excellence and scalability.'
  },
  amazon: {
    name: 'Amazon',
    style: 'Heavy focus on Leadership Principles (LPs). Every answer should follow STAR format. DSA questions are medium difficulty.',
    rounds: {
      technical: 'Medium DSA — arrays, linked lists, trees. Always ask candidate to walk through their thought process.',
      system_design: 'Design systems like Amazon marketplace, delivery system, recommendation engine.',
      hr: 'Use all 14 Leadership Principles: Customer Obsession, Ownership, Invent and Simplify, Are Right A Lot, Learn and Be Curious, Hire and Develop the Best, Insist on Highest Standards, Think Big, Bias for Action, Frugality, Earn Trust, Dive Deep, Have Backbone, Deliver Results.'
    },
    tips: 'Every behavioral answer must follow STAR format strictly.'
  },
  microsoft: {
    name: 'Microsoft',
    style: 'Balanced mix of DSA, problem solving, and culture fit. Growth mindset is very important.',
    rounds: {
      technical: 'DSA — focus on arrays, strings, trees. Ask candidate to explain approach before coding.',
      system_design: 'Design systems like Xbox Live, Office 365, Azure services.',
      hr: 'Growth mindset culture — ask about learning from failures, collaboration, and passion for technology.'
    },
    tips: 'Microsoft values growth mindset and collaboration highly.'
  },
  meta: {
    name: 'Meta',
    style: 'Fast-paced coding rounds, System Design at scale (billions of users), and behavioral questions around Meta values.',
    rounds: {
      technical: 'Hard DSA — graphs, dynamic programming, trees. Speed matters. Expect 2 problems per round.',
      system_design: 'Design social media features — News Feed, Instagram Stories, WhatsApp messaging at scale.',
      hr: 'Meta values — Move Fast, Be Bold, Focus on Impact, Be Open, Build Social Value.'
    },
    tips: 'Meta moves fast — show you can work under pressure.'
  },
  apple: {
    name: 'Apple',
    style: 'Deep technical knowledge, low-level system design, and passion for Apple products.',
    rounds: {
      technical: 'DSA + low level design. Ask about memory management, performance optimization.',
      system_design: 'Design Apple systems — iCloud, App Store, Siri.',
      hr: 'Passion for Apple products, attention to detail, innovation mindset.'
    },
    tips: 'Apple values perfection and attention to detail above all.'
  },
  flipkart: {
    name: 'Flipkart',
    style: 'Strong DSA, product thinking, and system design. Startup culture with high ownership expectations.',
    rounds: {
      technical: 'DSA — medium to hard. Focus on ecommerce related problems.',
      system_design: 'Design Flipkart search, recommendation, cart, payment systems.',
      hr: 'Ownership, customer focus, ability to work in fast-paced environment.'
    },
    tips: 'Show product thinking along with technical skills.'
  },
  swiggy: {
    name: 'Swiggy',
    style: 'Backend heavy, real-time systems, DSA, and logistics optimization problems.',
    rounds: {
      technical: 'DSA + backend design. Focus on real-time order tracking, optimization.',
      system_design: 'Design food delivery system, real-time tracking, surge pricing.',
      hr: 'Fast execution, customer obsession, data-driven decisions.'
    },
    tips: 'Know about food delivery domain and real-time systems.'
  },
  zomato: {
    name: 'Zomato',
    style: 'DSA, system design, and product thinking. Startup culture with emphasis on innovation.',
    rounds: {
      technical: 'DSA — medium difficulty. Focus on location-based problems.',
      system_design: 'Design restaurant discovery, review system, delivery optimization.',
      hr: 'Innovation, customer focus, growth mindset.'
    },
    tips: 'Show passion for food tech and consumer products.'
  },
  razorpay: {
    name: 'Razorpay',
    style: 'Fintech knowledge, backend systems, DSA, and security awareness.',
    rounds: {
      technical: 'DSA + backend. Focus on payment processing, security, reliability.',
      system_design: 'Design payment gateway, fraud detection, settlement system.',
      hr: 'Ownership, attention to detail, fintech passion.'
    },
    tips: 'Know basic fintech concepts — payments, settlements, UPI.'
  },
  cred: {
    name: 'CRED',
    style: 'High bar for technical excellence, product thinking, and premium user experience focus.',
    rounds: {
      technical: 'Hard DSA, clean code emphasis.',
      system_design: 'Design credit card management, rewards system, bill payments.',
      hr: 'Excellence mindset, attention to detail, premium product thinking.'
    },
    tips: 'CRED has very high hiring bar — prepare thoroughly.'
  },
  meesho: {
    name: 'Meesho',
    style: 'DSA, social commerce knowledge, and growth mindset for Tier 2/3 market.',
    rounds: {
      technical: 'Medium DSA, focus on scalability for large user base.',
      system_design: 'Design reseller platform, catalog management, social sharing.',
      hr: 'Growth mindset, frugality, impact for Bharat.'
    },
    tips: 'Understand Meesho business model — social commerce for Bharat.'
  },
  tcs: {
    name: 'TCS',
    style: 'Basic aptitude, fundamental coding, HR questions, and company knowledge.',
    rounds: {
      technical: 'Basic DSA — arrays, strings, sorting. Simple coding problems.',
      system_design: 'Basic system concepts — not very deep.',
      hr: 'Why TCS, career goals, strengths/weaknesses, situational questions.'
    },
    tips: 'Know TCS values, recent news, and business areas.'
  },
  infosys: {
    name: 'Infosys',
    style: 'Aptitude test, basic coding, and HR round. Communication and attitude matter.',
    rounds: {
      technical: 'Basic programming — loops, arrays, simple algorithms.',
      system_design: 'Basic concepts only.',
      hr: 'Why Infosys, teamwork, adaptability, learning attitude.'
    },
    tips: 'Infosys values learning agility and communication.'
  },
  wipro: {
    name: 'Wipro',
    style: 'Aptitude, basic coding, and communication focused interview.',
    rounds: {
      technical: 'Basic programming and aptitude questions.',
      system_design: 'Very basic system concepts.',
      hr: 'Why Wipro, career goals, teamwork examples.'
    },
    tips: 'Show willingness to learn and good communication.'
  },
  accenture: {
    name: 'Accenture',
    style: 'Communication focused, HR heavy, basic technical, and consulting mindset.',
    rounds: {
      technical: 'Basic technical questions, no heavy DSA.',
      system_design: 'Not applicable for freshers.',
      hr: 'Why Accenture, problem solving approach, client service mindset.'
    },
    tips: 'Accenture values communication and consulting mindset.'
  },
  cognizant: {
    name: 'Cognizant',
    style: 'Aptitude, basic coding, and HR round.',
    rounds: {
      technical: 'Basic programming and aptitude.',
      system_design: 'Basic concepts.',
      hr: 'Why Cognizant, teamwork, adaptability.'
    },
    tips: 'Good communication and positive attitude matter most.'
  },
  mckinsey: {
    name: 'McKinsey',
    style: 'Case study interviews, problem structuring, data analysis, and leadership potential.',
    rounds: {
      technical: 'Case studies — market sizing, business problems, data interpretation.',
      system_design: 'Not applicable.',
      hr: 'Personal Experience Interview (PEI) — leadership, impact, entrepreneurship.'
    },
    tips: 'Practice case studies extensively. Structure your answers clearly.'
  },
  deloitte: {
    name: 'Deloitte',
    style: 'Mix of case studies, technical knowledge, and HR questions.',
    rounds: {
      technical: 'Case studies + basic technical for tech roles.',
      system_design: 'Business process design.',
      hr: 'Why consulting, leadership examples, teamwork.'
    },
    tips: 'Know Deloitte service lines — Consulting, Advisory, Tax, Audit.'
  },
  goldman_sachs: {
    name: 'Goldman Sachs',
    style: 'Hard DSA, finance knowledge, and behavioral questions around integrity and excellence.',
    rounds: {
      technical: 'Hard DSA — similar to FAANG level.',
      system_design: 'Design trading systems, risk management.',
      hr: 'Why finance, integrity, excellence, teamwork under pressure.'
    },
    tips: 'Know basic finance concepts — markets, trading, risk.'
  },
  jp_morgan: {
    name: 'JP Morgan',
    style: 'DSA, finance domain knowledge, system design for financial systems.',
    rounds: {
      technical: 'Medium-Hard DSA + finance knowledge.',
      system_design: 'Design payment systems, fraud detection, trading platforms.',
      hr: 'Why finance tech, integrity, client focus.'
    },
    tips: 'Combine strong technical skills with basic finance knowledge.'
  },
  salesforce: {
    name: 'Salesforce',
    style: 'DSA, cloud concepts, CRM knowledge, and Ohana culture fit.',
    rounds: {
      technical: 'Medium DSA + cloud/SaaS concepts.',
      system_design: 'Design CRM systems, multi-tenant architecture.',
      hr: 'Ohana culture — equality, giving back, trust, innovation.'
    },
    tips: 'Know Salesforce products and cloud/SaaS concepts.'
  },
  adobe: {
    name: 'Adobe',
    style: 'DSA, system design, creativity, and passion for design/creativity tools.',
    rounds: {
      technical: 'Medium-Hard DSA, focus on creative problem solving.',
      system_design: 'Design creative tools, document management, cloud storage.',
      hr: 'Creativity, innovation, passion for design tools.'
    },
    tips: 'Show passion for creative technology and design.'
  },
  ibm: {
    name: 'IBM',
    style: 'Communication focused, basic technical, and innovation mindset.',
    rounds: {
      technical: 'Basic to medium DSA, focus on problem-solving approach.',
      system_design: 'Basic system concepts, cloud awareness.',
      hr: 'Why IBM, innovation, diversity mindset, client focus.'
    },
    tips: 'IBM values innovation, diversity, and client service.'
  },
  oracle: {
    name: 'Oracle',
    style: 'DSA, database knowledge, and system design for enterprise applications.',
    rounds: {
      technical: 'Medium DSA + database concepts — SQL, indexing, optimization.',
      system_design: 'Design enterprise database systems, cloud infrastructure.',
      hr: 'Why Oracle, customer success focus, technical depth.'
    },
    tips: 'Strong database knowledge is a big plus at Oracle.'
  }
};

const buildSystemPrompt = (role, difficulty, domain, company = null, round = 'technical') => {
  const companyProfile = company ? COMPANY_PROFILES[company.toLowerCase()] : null;

  if (companyProfile) {
    return `
You are an expert interviewer at ${companyProfile.name} conducting a ${difficulty} level ${round} round interview for the position of ${role}.

Company Culture & Style:
${companyProfile.style}

This Round Focus:
${companyProfile.rounds[round] || companyProfile.rounds.technical}

Your behavior:
- Start by introducing yourself as an interviewer at ${companyProfile.name}
- Ask one question at a time
- Follow ${companyProfile.name} actual interview style strictly
- Give follow-up questions based on answers
- After 6-8 exchanges wrap up professionally
- Be encouraging but maintain ${companyProfile.name} interview bar

Important:
${companyProfile.tips}

Never reveal you are an AI. Act as a human interviewer named "Alex" from ${companyProfile.name}.
    `.trim();
  }

  return `
You are an expert technical interviewer conducting a ${difficulty} level interview
for the position of ${role} focusing on ${domain}.

Your behavior:
- Start by warmly greeting the candidate and asking your first question
- Ask one question at a time
- Listen to their answer and ask a natural follow-up
- After 6-8 exchanges wrap up professionally
- Adapt questions based on answers
- Be encouraging but professional

Never reveal you are an AI. Act as a human interviewer named "Alex".
  `.trim();
};

const callGemini = async (systemPrompt, messages) => {
  for (const modelName of MODELS) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt
      });

      const history = messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const lastMessage = messages[messages.length - 1].content;
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(lastMessage);
      return result.response.text();

    } catch (err) {
      console.error(`Model ${modelName} failed:`, err.message);
      if (modelName === MODELS[MODELS.length - 1]) throw err;
      console.log('Trying next model...');
    }
  }
};

const callGeminiDirect = async (prompt) => {
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.error(`Model ${modelName} failed:`, err.message);
      if (modelName === MODELS[MODELS.length - 1]) throw err;
      console.log('Trying next model...');
    }
  }
};

// Start interview
exports.startInterview = async (req, res) => {
  try {
    const { role, difficulty, domain, company, round } = req.body;

    if (!role || !difficulty || !domain)
      return res.status(400).json({ message: 'role, difficulty and domain are required' });

    const systemPrompt = buildSystemPrompt(role, difficulty, domain, company, round);

    const aiMessage = await callGemini(systemPrompt, [
      { role: 'user', content: 'Start the interview.' }
    ]);

    const interview = await Interview.create({
      student: req.user._id,
      role, difficulty, domain,
      company: company || null,
      round: round || 'technical',
      messages: [
        { role: 'user', content: 'Start the interview.' },
        { role: 'assistant', content: aiMessage }
      ]
    });

    res.status(201).json({ interviewId: interview._id, message: aiMessage });

  } catch (err) {
    console.error('startInterview error:', err.message);
    res.status(500).json({ message: 'Failed to start interview', error: err.message });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { interviewId, userMessage } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    if (interview.status === 'completed')
      return res.status(400).json({ message: 'Interview already completed' });

    interview.messages.push({ role: 'user', content: userMessage });

    const systemPrompt = buildSystemPrompt(
      interview.role,
      interview.difficulty,
      interview.domain,
      interview.company,
      interview.round
    );

    const aiMessage = await callGemini(
      systemPrompt,
      interview.messages.map(m => ({ role: m.role, content: m.content }))
    );

    interview.messages.push({ role: 'assistant', content: aiMessage });
    await interview.save();

    res.json({
      message: aiMessage,
      totalExchanges: Math.floor(interview.messages.length / 2)
    });

  } catch (err) {
    console.error('sendMessage error:', err.message);
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};

// End interview + feedback
exports.endInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    const transcript = interview.messages
      .map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`)
      .join('\n\n');

    const companyContext = interview.company
      ? `This was a ${interview.company.toUpperCase()} ${interview.round} round interview.`
      : '';

    const prompt = `Analyze this interview transcript and return ONLY a valid JSON object with no extra text, no markdown, no backticks.

${companyContext}

Transcript:
${transcript}

Return exactly this structure:
{
  "score": <number 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["area 1", "area 2", "area 3"],
  "summary": "2-3 sentence overall assessment"
}`;

    const raw = await callGeminiDirect(prompt);
    const clean = raw.replace(/```json|```/g, '').trim();
    const feedback = JSON.parse(clean);

    interview.feedback = feedback;
    interview.status = 'completed';
    await interview.save();

    res.json({ feedback, interviewId });

  } catch (err) {
    console.error('endInterview error:', err.message);
    res.status(500).json({ message: 'Failed to generate feedback', error: err.message });
  }
};

// Get all interviews
exports.getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ student: req.user._id })
      .select('role difficulty domain company round status feedback createdAt')
      .sort({ createdAt: -1 });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single interview
exports.getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Not found' });
    if (interview.student.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Unauthorized' });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};