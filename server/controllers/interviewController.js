const Interview = require('../models/Interview');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
  'gemini-2.0-flash-lite',  // primary — 1500/day free
  'gemini-2.0-flash',       // fallback — 200/day free
  'gemini-flash-latest'     // last resort
];

const buildSystemPrompt = (role, difficulty, domain) => `
You are an expert technical interviewer conducting a ${difficulty} level interview 
for the position of ${role} focusing on ${domain}.

Your behavior:
- Start by warmly greeting the candidate and asking your first question
- Ask one question at a time — never multiple questions together
- Listen to their answer and ask a natural follow-up or probe deeper
- After 6-8 exchanges, wrap up the interview professionally
- Adapt your questions based on their answers
- Be encouraging but professional throughout

Question types to mix:
- Technical concepts (${domain} specific)
- Problem-solving approach
- Real-world scenario handling
- Communication and thought process

Never reveal you are an AI. Act as a human interviewer named "Alex".
`.trim();

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
      console.log(`Trying model: ${modelName}`);
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
    const { role, difficulty, domain } = req.body;

    if (!role || !difficulty || !domain)
      return res.status(400).json({ message: 'role, difficulty and domain are required' });

    const systemPrompt = buildSystemPrompt(role, difficulty, domain);

    const aiMessage = await callGemini(systemPrompt, [
      { role: 'user', content: 'Start the interview.' }
    ]);

    const interview = await Interview.create({
      student: req.user._id,
      role, difficulty, domain,
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
      interview.domain
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

    const prompt = `Analyze this interview transcript and return ONLY a valid JSON object with no extra text, no markdown, no backticks.

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
      .select('role difficulty domain status feedback createdAt')
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