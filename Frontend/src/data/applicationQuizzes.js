export const QUIZ_PASS_MARK = 60;
export const QUIZ_MAX_ATTEMPTS = 3;

function q(id, prompt, options, correct) {
  return { id, prompt, options, correct };
}

const banks = {
  "data-science": {
    id: "data-science",
    title: "Data Science Technical Assessment",
    subtitle: "Basic maths and data science concepts",
    questions: [
      q(
        "ds1",
        "In hypothesis testing, what does a p-value help you decide?",
        [
          "Whether a result is practically useful in business",
          "The correlation between two variables",
          "How surprising the observed data would be if the null hypothesis were true",
          "The size of the difference between two groups",
        ],
        2
      ),
      q(
        "ds2",
        "Which of these is not one of the classic “3 Vs” of big data?",
        [
          "The market value of the dataset",
          "The variety of data formats",
          "The velocity at which data arrives",
          "The volume of data collected",
        ],
        0
      ),
      q(
        "ds3",
        "A workshop pays 20 people KSh 10, 15 people KSh 8, and 5 people KSh 3 per day. What is the weighted mean daily wage?",
        ["3.86", "8.38", "9.21", "10.63"],
        1
      ),
      q(
        "ds4",
        "For the numbers 10, 20, 30, 40, 50, the sum of deviations from the mean is:",
        ["60", "15", "30", "0"],
        3
      ),
      q(
        "ds5",
        "What is the main difference between supervised and unsupervised learning?",
        [
          "Supervised learning only works with numbers",
          "Supervised learning trains on labeled examples; unsupervised learning finds structure in unlabeled data",
          "Supervised learning is always faster",
          "Supervised learning always needs more data",
        ],
        1
      ),
    ],
  },
  "data-analytics": {
    id: "data-analytics",
    title: "Data Analytics Assessment",
    subtitle: "Charts, cleaning, and business questions",
    questions: [
      q(
        "da1",
        "A dashboard should start from which question?",
        [
          "Which chart looks most colourful?",
          "What decision should this view help someone make?",
          "How many tables can we fit on one page?",
          "Which programming language is newest?",
        ],
        1
      ),
      q(
        "da2",
        "Which chart is usually best for comparing parts of a whole when there are only a few categories?",
        ["Line chart", "Scatter plot", "Pie or donut chart", "Map"],
        2
      ),
      q(
        "da3",
        "You find empty cells and mixed date formats in a spreadsheet. The first professional step is to:",
        [
          "Delete the whole file",
          "Publish the chart immediately",
          "Clean and document the data before analysing it",
          "Change every number to zero",
        ],
        2
      ),
      q(
        "da4",
        "A filter in Excel or a BI tool is used to:",
        [
          "Encrypt the workbook",
          "Show only the rows that match a condition",
          "Increase RAM on the laptop",
          "Rename the company",
        ],
        1
      ),
      q(
        "da5",
        "Which statement about averages is true?",
        [
          "The mean is never affected by extreme values",
          "The median is often more robust than the mean when outliers exist",
          "Mode and mean are always equal",
          "Averages can replace checking the raw data",
        ],
        1
      ),
    ],
  },
  "business-intelligence": {
    id: "business-intelligence",
    title: "Business Intelligence Assessment",
    subtitle: "Reporting, KPIs, and decision support",
    questions: [
      q(
        "bi1",
        "A KPI is most useful when it is:",
        [
          "A long paragraph with no number",
          "Tied to a clear business goal and tracked over time",
          "Hidden from the team that owns the work",
          "Changed every hour without a reason",
        ],
        1
      ),
      q(
        "bi2",
        "What is a data warehouse mainly for?",
        [
          "Storing raw photos only",
          "Playing games offline",
          "Combining cleaned historical data so reports stay consistent",
          "Replacing all staff meetings",
        ],
        2
      ),
      q(
        "bi3",
        "If sales went up but profit went down, a BI analyst should:",
        [
          "Ignore profit and celebrate sales",
          "Investigate costs, discounts, and product mix",
          "Delete last month’s data",
          "Assume the dashboard is always wrong",
        ],
        1
      ),
      q(
        "bi4",
        "A star schema typically has:",
        [
          "Only one spreadsheet tab",
          "Fact tables connected to dimension tables",
          "No relationships between tables",
          "Passwords stored in plain text",
        ],
        1
      ),
      q(
        "bi5",
        "Self-service BI works best when:",
        [
          "Anyone can overwrite official definitions without review",
          "Business users explore trusted, well-defined metrics",
          "IT never documents the data",
          "Reports are emailed as screenshots only",
        ],
        1
      ),
    ],
  },
  "software-engineering": {
    id: "software-engineering",
    title: "Software Engineering Assessment",
    subtitle: "Logic, web basics, and problem solving",
    questions: [
      q(
        "se1",
        "What does a function in a program mainly help you do?",
        [
          "Make the computer slower on purpose",
          "Group reusable steps under a name",
          "Delete the operating system",
          "Change the Wi-Fi password",
        ],
        1
      ),
      q(
        "se2",
        "In a web app, the frontend is usually responsible for:",
        [
          "What the user sees and interacts with",
          "Only the database backups",
          "The electricity bill",
          "Hiring staff",
        ],
        0
      ),
      q(
        "se3",
        "A variable is best described as:",
        [
          "A named place to store a value that can change",
          "A type of keyboard",
          "A finished website",
          "A password that never changes",
        ],
        0
      ),
      q(
        "se4",
        "Git is mainly used to:",
        [
          "Design logos",
          "Track versions of code and collaborate",
          "Charge a laptop",
          "Block all websites",
        ],
        1
      ),
      q(
        "se5",
        "If a loop should run while a condition is true, you are thinking about:",
        [
          "A comment",
          "An image file",
          "Iteration / repetition",
          "A colour theme",
        ],
        2
      ),
    ],
  },
  devops: {
    id: "devops",
    title: "DevOps Assessment",
    subtitle: "Delivery, environments, and reliability",
    questions: [
      q(
        "do1",
        "Continuous Integration (CI) is mainly about:",
        [
          "Waiting months before combining code",
          "Automatically building and testing changes often",
          "Printing code on paper",
          "Turning off the internet",
        ],
        1
      ),
      q(
        "do2",
        "A container (for example Docker) helps you:",
        [
          "Pack an app with its dependencies so it runs the same way in different places",
          "Increase the office rent",
          "Write marketing slogans",
          "Replace all passwords with “1234”",
        ],
        0
      ),
      q(
        "do3",
        "Infrastructure as Code means:",
        [
          "Servers are described and versioned in files, not only clicked in a console",
          "Nobody is allowed to use the cloud",
          "Code is never reviewed",
          "Laptops cannot be updated",
        ],
        0
      ),
      q(
        "do4",
        "Monitoring in production is important because:",
        [
          "It makes the logo bigger",
          "It helps you notice failures and slowdowns early",
          "It deletes customer data automatically",
          "It replaces backups",
        ],
        1
      ),
      q(
        "do5",
        "A rollback is used when:",
        [
          "A release causes problems and you return to a last known good version",
          "You want to add more features immediately",
          "The team goes on holiday",
          "You rename a folder",
        ],
        0
      ),
    ],
  },
  hardware: {
    id: "hardware",
    title: "Computer Maintenance Assessment",
    subtitle: "Hardware, safety, and troubleshooting",
    questions: [
      q(
        "hw1",
        "Before opening a desktop case you should first:",
        [
          "Pour water on the power supply",
          "Power off and unplug the machine",
          "Hold the motherboard by the chips",
          "Disable all backups",
        ],
        1
      ),
      q(
        "hw2",
        "RAM is mainly used for:",
        [
          "Long-term file storage like a hard drive",
          "Short-term working memory while programs run",
          "Cooling the CPU only",
          "Connecting to Wi-Fi",
        ],
        1
      ),
      q(
        "hw3",
        "A computer that overheats and shuts down is most likely having:",
        [
          "A cooling or dust problem",
          "Too many bookmarks",
          "A missing desktop wallpaper",
          "An unused HDMI cable",
        ],
        0
      ),
      q(
        "hw4",
        "Which is a safe first step when a PC will not start?",
        [
          "Hit the case with a hammer",
          "Check power cable, socket, and power button",
          "Format the disk immediately",
          "Install a new operating system in the dark",
        ],
        1
      ),
      q(
        "hw5",
        "SSD storage is generally:",
        [
          "Slower than a spinning hard disk for everyday files",
          "Faster and more shock-resistant than a typical HDD",
          "Used only for printers",
          "The same as RAM",
        ],
        1
      ),
    ],
  },
  "cyber-security": {
    id: "cyber-security",
    title: "Cybersecurity Assessment",
    subtitle: "Threats, hygiene, and safe practice",
    questions: [
      q(
        "cy1",
        "Phishing is best described as:",
        [
          "A hardware cooling method",
          "Tricking people into giving secrets through fake messages or sites",
          "A type of database index",
          "Encrypting a hard disk",
        ],
        1
      ),
      q(
        "cy2",
        "A strong password is usually:",
        [
          "Your name plus the year",
          "Long, unique, and hard to guess — ideally in a password manager",
          "Shared with the whole class",
          "Written on the monitor",
        ],
        1
      ),
      q(
        "cy3",
        "Two-factor authentication adds security by:",
        [
          "Asking for a second proof besides the password",
          "Removing all passwords",
          "Hiding the username",
          "Turning off updates",
        ],
        0
      ),
      q(
        "cy4",
        "Which action is safest on a public café Wi-Fi?",
        [
          "Log into the bank with no extra protection",
          "Avoid sensitive logins or use a trusted VPN",
          "Share your password in the group chat",
          "Disable the firewall",
        ],
        1
      ),
      q(
        "cy5",
        "Keeping software updated mainly helps because:",
        [
          "Updates always add games",
          "Vendors often patch known security holes",
          "It deletes your files",
          "It makes phishing legal",
        ],
        1
      ),
    ],
  },
  "ai-foundations": {
    id: "ai-foundations",
    title: "AI Foundations Assessment",
    subtitle: "How AI systems work and how to use them well",
    questions: [
      q(
        "ai1",
        "A large language model generates text by:",
        [
          "Looking up one official encyclopaedia page only",
          "Predicting likely next tokens from patterns in training data",
          "Reading your mind",
          "Always telling the legal truth",
        ],
        1
      ),
      q(
        "ai2",
        "A good prompt is usually:",
        [
          "Vague and one word",
          "Clear about the task, audience, and constraints",
          "Written in all caps with no goal",
          "A copy of someone else’s password",
        ],
        1
      ),
      q(
        "ai3",
        "Why should you verify important AI answers?",
        [
          "Models can be confidently wrong or outdated",
          "AI is never allowed to be helpful",
          "Teachers dislike computers",
          "The internet is offline forever",
        ],
        0
      ),
      q(
        "ai4",
        "Generative AI is a poor fit when you need:",
        [
          "A first draft to edit",
          "Guaranteed, cited legal or medical advice without a professional",
          "Brainstorming ideas",
          "Practice interview questions",
        ],
        1
      ),
      q(
        "ai5",
        "Training data for a model is:",
        [
          "The examples the system learned from",
          "The colour of the keyboard",
          "The Wi-Fi name",
          "The student’s lunch order",
        ],
        0
      ),
    ],
  },
  "ai-agents": {
    id: "ai-agents",
    title: "AI Agents Assessment",
    subtitle: "Tools, workflows, and automation",
    questions: [
      q(
        "ag1",
        "An AI agent typically differs from a single chatbot reply because it can:",
        [
          "Only change font size",
          "Plan steps and call tools or APIs to complete a task",
          "Replace electricity",
          "Never make a mistake",
        ],
        1
      ),
      q(
        "ag2",
        "A workflow automation is most useful when:",
        [
          "The same steps repeat and rules are clear",
          "Every case is unique art with no pattern",
          "You want to hide errors from users",
          "The internet is banned",
        ],
        0
      ),
      q(
        "ag3",
        "Giving an agent access to email send should include:",
        [
          "No limits and no logs",
          "Permissions, review, and an audit trail",
          "Publishing every password",
          "Turning off 2FA",
        ],
        1
      ),
      q(
        "ag4",
        "If an automated step fails, a reliable design will:",
        [
          "Retry thoughtfully and alert a human when needed",
          "Delete the customer record",
          "Ignore the error forever",
          "Restart the country",
        ],
        0
      ),
      q(
        "ag5",
        "A “human in the loop” means:",
        [
          "A person reviews or approves high-risk actions",
          "No person may use the system",
          "The model trains itself on private chats without consent",
          "The server is unplugged",
        ],
        0
      ),
    ],
  },
  "ai-marketing": {
    id: "ai-marketing",
    title: "Digital Marketing with AI Assessment",
    subtitle: "Audience, channels, and responsible promotion",
    questions: [
      q(
        "mk1",
        "A marketing campaign should start with:",
        [
          "Buying every ad platform at once",
          "A clear audience and a single main offer or message",
          "Copying a competitor’s logo",
          "Hiding the price in 8-point text only",
        ],
        1
      ),
      q(
        "mk2",
        "A call to action (CTA) is:",
        [
          "The next step you want the reader to take",
          "The office Wi-Fi password",
          "A type of camera lens",
          "The company registration number only",
        ],
        0
      ),
      q(
        "mk3",
        "Using AI to write ads is responsible when you:",
        [
          "Publish claims you have not checked",
          "Edit for truth, brand voice, and platform rules",
          "Impersonate a real customer",
          "Buy fake reviews",
        ],
        1
      ),
      q(
        "mk4",
        "Open rate in email marketing measures:",
        [
          "How many people opened the email",
          "How fast the website loads",
          "The number of printers in the office",
          "Laptop battery life",
        ],
        0
      ),
      q(
        "mk5",
        "Personal data used for ads should be:",
        [
          "Collected and used with a lawful basis and respect for privacy",
          "Sold to anyone without a notice",
          "Guessed from rumours",
          "Posted in a public spreadsheet",
        ],
        0
      ),
    ],
  },
  "ai-engineering": {
    id: "ai-engineering",
    title: "Applied AI Engineering Assessment",
    subtitle: "Models, evaluation, and production thinking",
    questions: [
      q(
        "ae1",
        "Overfitting means a model:",
        [
          "Memorises training examples and generalises poorly",
          "Always works better on new data",
          "Has no parameters",
          "Cannot store numbers",
        ],
        0
      ),
      q(
        "ae2",
        "A train / validation / test split is used to:",
        [
          "Make the dataset smaller for no reason",
          "Estimate how the model will do on unseen data",
          "Hide errors from users",
          "Increase the font size",
        ],
        1
      ),
      q(
        "ae3",
        "An API for a model should typically include:",
        [
          "No authentication and unlimited free compute",
          "Input checks, auth, and usage limits",
          "The training dataset pasted in every response",
          "Admin passwords in the URL",
        ],
        1
      ),
      q(
        "ae4",
        "Temperature in a text model usually controls:",
        [
          "How random or varied the next tokens can be",
          "The server room air conditioning",
          "The colour of the UI",
          "Disk space on the laptop",
        ],
        0
      ),
      q(
        "ae5",
        "Retrieval-augmented generation (RAG) is used to:",
        [
          "Ground answers in documents you provide at query time",
          "Delete the knowledge base",
          "Train a model from scratch every request",
          "Replace all databases with images",
        ],
        0
      ),
    ],
  },
  dpo: {
    id: "dpo",
    title: "Data Protection Assessment",
    subtitle: "Privacy, consent, and Kenya-aligned principles",
    questions: [
      q(
        "dp1",
        "The most important duty when handling personal data is to:",
        [
          "Protect people’s privacy and follow the applicable data-protection law",
          "Maximise profit from selling contacts",
          "Share files with as many researchers as possible",
          "Keep data only if it looks tidy",
        ],
        0
      ),
      q(
        "dp2",
        "Consent for processing should be:",
        [
          "Hidden in unread terms and assumed forever",
          "Informed, specific, and easy to withdraw",
          "Given by a stranger on the street",
          "Replaced by a louder advert",
        ],
        1
      ),
      q(
        "dp3",
        "A data breach response should include:",
        [
          "Hoping nobody notices",
          "Containing the issue, assessing impact, and notifying as the law requires",
          "Posting all passwords online",
          "Deleting the backup first",
        ],
        1
      ),
      q(
        "dp4",
        "Collecting only the data you need is called:",
        [
          "Data maximisation",
          "Data minimisation",
          "Open dumping",
          "Cookie painting",
        ],
        1
      ),
      q(
        "dp5",
        "A Data Protection Officer’s role is mainly to:",
        [
          "Advise on compliance and help the organisation respect people’s rights",
          "Sell the customer list",
          "Ignore access requests",
          "Turn off all computers at noon",
        ],
        0
      ),
    ],
  },
  "high-school": {
    id: "high-school",
    title: "Holiday Tech Bootcamp Assessment",
    subtitle: "Curious thinking and digital basics",
    questions: [
      q(
        "hs1",
        "The internet is best described as:",
        [
          "One computer in Nairobi",
          "A global network of networks that lets devices share information",
          "A single WhatsApp group",
          "A type of battery",
        ],
        1
      ),
      q(
        "hs2",
        "If a website asks for your password by email, you should:",
        [
          "Reply with the password immediately",
          "Treat it as suspicious and check with a trusted adult or official site",
          "Forward it to everyone in class",
          "Change nothing and ignore school rules",
        ],
        1
      ),
      q(
        "hs3",
        "A computer program is:",
        [
          "A list of instructions the computer can follow",
          "A chair",
          "Only a printed book",
          "The power cable",
        ],
        0
      ),
      q(
        "hs4",
        "Which file type is usually an image?",
        [".mp3", ".png or .jpg", ".exe that you do not trust", ".txt only"],
        1
      ),
      q(
        "hs5",
        "Being a good teammate in a tech project means:",
        [
          "Hiding your work and blaming others",
          "Listening, sharing progress, and asking for help early",
          "Deleting the group files",
          "Using someone else’s login",
        ],
        1
      ),
    ],
  },
};

const programToBank = {
  "data-science-bootcamp": "data-science",
  "introduction-to-data-science": "data-science",
  "data-analytics": "data-analytics",
  "business-intelligence": "business-intelligence",
  "full-stack-software-engineering-bootcamp": "software-engineering",
  "introduction-to-software-engineering": "software-engineering",
  "introduction-to-devops-engineering": "devops",
  "aws-devops-engineering-bootcamp": "devops",
  "computer-software-and-hardware-maintenance": "hardware",
  "introduction-to-cybersecurity": "cyber-security",
  "cybersecurity-bootcamp": "cyber-security",
  "ai-for-learning": "ai-foundations",
  "generative-ai-essentials": "ai-foundations",
  "ai-agents-and-workflow-automation": "ai-agents",
  "digital-marketing-with-ai": "ai-marketing",
  "applied-ai-engineering": "ai-engineering",
  "advanced-llms": "ai-engineering",
  "certified-data-protection-officer": "dpo",
  "high-school-holiday-tech-bootcamp": "high-school",
};

const categoryToBank = {
  "data-courses": "data-science",
  "software-engineering": "software-engineering",
  "cyber-security": "cyber-security",
  ai: "ai-foundations",
  dpo: "dpo",
  "high-school-bootcamp": "high-school",
};

export function resolveQuizId(categorySlug, programSlug) {
  return programToBank[programSlug] || categoryToBank[categorySlug] || "software-engineering";
}

export function getQuiz(categorySlug, programSlug) {
  return banks[resolveQuizId(categorySlug, programSlug)] || banks["software-engineering"];
}

function normalizeAnswers(answers) {
  if (Array.isArray(answers)) {
    return Object.fromEntries(
      answers
        .filter((item) => item && item.id != null)
        .map((item) => [item.id, item.selected ?? item.chosen])
    );
  }
  return answers && typeof answers === "object" ? answers : {};
}

export function gradeAssessment({ categorySlug, programSlug, answers, attempts } = {}) {
  const quiz = getQuiz(categorySlug, programSlug);
  const chosen = normalizeAnswers(answers);
  let correct = 0;
  const details = quiz.questions.map((item) => {
    const selected = Number(chosen[item.id]);
    const ok = Number.isInteger(selected) && selected === item.correct;
    if (ok) correct += 1;
    return { id: item.id, selected: Number.isInteger(selected) ? selected : null, ok };
  });
  const total = quiz.questions.length;
  const score = total ? Math.round((correct / total) * 100) : 0;
  const attemptCount = Math.min(Math.max(Number(attempts) || 1, 1), QUIZ_MAX_ATTEMPTS);
  return {
    quizId: quiz.id,
    title: quiz.title,
    score,
    correct,
    total,
    passed: score >= QUIZ_PASS_MARK,
    passMark: QUIZ_PASS_MARK,
    attempts: attemptCount,
    answers: details,
  };
}

export function publicQuiz(categorySlug, programSlug) {
  const quiz = getQuiz(categorySlug, programSlug);
  return {
    id: quiz.id,
    title: quiz.title,
    subtitle: quiz.subtitle,
    passMark: QUIZ_PASS_MARK,
    maxAttempts: QUIZ_MAX_ATTEMPTS,
    questions: quiz.questions.map(({ id, prompt, options }) => ({ id, prompt, options })),
  };
}
