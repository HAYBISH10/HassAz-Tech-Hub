const FEE = "Confirmed during admissions";
const INTAKE = "Upcoming intake";

function mode(id, label, duration, schedule) {
  return { id, label, startDate: INTAKE, duration, schedule, fee: FEE };
}

const ftRemote = (weeks) =>
  mode("full-time-remote", "Full-time Remote", `${weeks} Weeks`, "100% Online Classes | Mon - Fri | 8 am - 5 pm E.A.T");
const ftHybrid = (weeks) =>
  mode("full-time-hybrid", "Full-time Hybrid", `${weeks} Weeks`, "Online & Physical Classes | Mon - Fri | 8 am - 5 pm E.A.T");
const ftInPerson = (weeks) =>
  mode("full-time-in-person", "Full-time In-person", `${weeks} Weeks`, "100% In Person Classes | Mon - Fri | 8 am - 5 pm E.A.T");
const ptRemote = (weeks) =>
  mode("part-time-remote", "Part-time Remote", `${weeks} Weeks`, "100% Online Classes | Mon - Fri | 6 pm - 9 pm E.A.T");
const selfPaced = (weeks) =>
  mode("self-paced", "Self Paced", `${weeks} Weeks guided`, "Study on your schedule with mentor check-ins");
const partTime = (weeks) =>
  mode("part-time", "Part Time", `${weeks} Weeks`, "Evening / weekend live sessions");

function careerProgram(slug, title, summary, intro, careers, items) {
  return {
    slug,
    title,
    summary,
    headline: title,
    intro,
    careers,
    details: [
      {
        title: "Who is this course for?",
        body: "Beginners and career switchers who want practical, job-ready skills with guided practice at HassAz Tech Hub.",
      },
      {
        title: "What are the course prerequisites?",
        body: "A laptop, basic computer use, and commitment to attend classes and complete assignments. No degree is required.",
      },
      {
        title: "Why study at HassAz Tech Hub?",
        body: "Live mentoring, hands-on labs, and a learning culture focused on building, not watching slides.",
      },
    ],
    curriculum: [{ title: "What you will learn", items }],
    modes: [ftHybrid(12), ftRemote(12), ptRemote(16)],
  };
}

const catalogData = [
  {
    slug: "software-engineering",
    title: "Software Engineering",
    summary:
      "Become a software engineer to help businesses develop software, build web applications, and products that will help shape the future of the company.",
    programs: [
      {
        slug: "full-stack-software-engineering-bootcamp",
        title: "Full Stack Software Engineering Bootcamp",
        summary: "Train for job-ready full stack work: interfaces, APIs, databases, and deployment.",
        headline: "Build complete web products from idea to launch",
        intro:
          "This bootcamp takes you through practical software engineering, from programming fundamentals to shipping full stack applications. You will work in labs, code reviews, and a capstone that belongs in a portfolio.",
        careers: ["Junior Software Engineer", "Full Stack Developer", "Web Developer"],
        details: [
          {
            title: "Who is this course for?",
            body: "Career switchers, recent graduates, and working professionals who want a structured path into software engineering.",
          },
          {
            title: "What are the course prerequisites?",
            body: "Comfort using a computer, commitment to weekday practice, and a laptop. No computer science degree is required.",
          },
          {
            title: "Why learn software engineering?",
            body: "Teams need people who can turn requirements into working software. This path is built around that craft.",
          },
          {
            title: "Why study at HassAz Tech Hub?",
            body: "Live mentoring, project reviews, and a learning culture focused on building, not watching slides.",
          },
        ],
        curriculum: [
          {
            title: "Foundations & tooling",
            items: ["Development environment", "Git and GitHub", "HTML, CSS, and JavaScript essentials"],
          },
          {
            title: "Frontend applications",
            items: ["Component-based UI", "State and routing", "Accessible, responsive layouts"],
          },
          {
            title: "Backend & data",
            items: ["APIs with Node.js", "Databases and modeling", "Authentication basics"],
          },
          {
            title: "Career studio",
            items: ["Portfolio project", "Resume and GitHub review", "Interview practice"],
          },
        ],
        modes: [ftHybrid(24), ftRemote(24), ptRemote(32)],
      },
      {
        slug: "introduction-to-software-engineering",
        title: "Introduction to Software Engineering",
        summary: "A first structured step into programming, the web, and how software teams work.",
        headline: "Start your software journey with confidence",
        intro:
          "Learn how software is planned, written, and shipped. You will write real code, understand core concepts, and leave ready for a longer bootcamp or junior practice.",
        careers: ["Junior Developer Intern", "IT Support with coding skills"],
        details: [
          {
            title: "Who is this course for?",
            body: "Beginners, high-school leavers, and professionals testing whether software engineering is the right path.",
          },
          {
            title: "What are the course prerequisites?",
            body: "Curiosity, basic computer use, and time to complete weekly exercises.",
          },
        ],
        curriculum: [
          {
            title: "How software is built",
            items: ["Problem solving", "Version control basics", "Working with a team workflow"],
          },
          {
            title: "First applications",
            items: ["Web page structure", "Introductory programming", "Mini project"],
          },
        ],
        modes: [ftInPerson(8), ftRemote(8)],
      },
      {
        slug: "introduction-to-devops-engineering",
        title: "Introduction to DevOps Engineering",
        summary: "Understand CI/CD, Linux basics, and how modern teams ship software safely.",
        headline: "Learn how software moves from laptop to production",
        intro:
          "DevOps connects development and operations. This course introduces Linux, automation, containers, and the habits that keep releases reliable.",
        careers: ["Junior DevOps Associate", "Release Support"],
        details: [
          {
            title: "Who is this course for?",
            body: "Developers, IT practitioners, and career starters who want to work on delivery and infrastructure.",
          },
          {
            title: "What are the course prerequisites?",
            body: "Basic programming or IT experience helps, but motivated beginners can start here.",
          },
        ],
        curriculum: [
          {
            title: "Operating systems & scripting",
            items: ["Linux command line", "Bash basics", "Process and service awareness"],
          },
          {
            title: "Delivery pipeline",
            items: ["Git workflows", "CI concepts", "Intro to containers"],
          },
        ],
        modes: [ptRemote(10)],
      },
      {
        slug: "aws-devops-engineering-bootcamp",
        title: "AWS DevOps Engineering BootCamp",
        summary: "Practice cloud operations on AWS: deploy, monitor, and automate with DevOps workflows.",
        headline: "Operate applications on AWS with a DevOps mindset",
        intro:
          "Build cloud skills through labs: accounts, networking basics, compute, storage, pipelines, and observing what you deploy.",
        careers: ["Cloud Support Associate", "Junior DevOps Engineer"],
        details: [
          {
            title: "Who is this course for?",
            body: "IT, software, and operations learners targeting cloud and DevOps roles.",
          },
          {
            title: "What are the course prerequisites?",
            body: "Comfort with the command line and a willingness to complete weekly labs.",
          },
        ],
        curriculum: [
          {
            title: "AWS building blocks",
            items: ["Identity and access", "Compute and storage", "Networking essentials"],
          },
          {
            title: "Automate & observe",
            items: ["Infrastructure as code intro", "CI/CD on the cloud", "Logging and basic monitoring"],
          },
        ],
        modes: [ptRemote(16)],
      },
      {
        slug: "computer-software-and-hardware-maintenance",
        title: "Computer Software and Hardware Maintenance",
        summary: "Diagnose, repair, and maintain computers, from operating systems to internal hardware components.",
        headline: "Learn to build, fix, and maintain computers with confidence",
        intro:
          "A practical, hands-on program covering computer assembly, hardware troubleshooting, operating system installation, and software maintenance. You will work directly on real machines and leave able to diagnose and resolve common computer problems for individuals, offices, and small businesses.",
        careers: ["Computer Technician", "IT Support Assistant", "Hardware & Software Maintenance Officer"],
        details: [
          {
            title: "Who is this course for?",
            body: "Beginners, IT support staff, and entrepreneurs who want practical skills in repairing and maintaining computers.",
          },
          {
            title: "What are the course prerequisites?",
            body: "Basic computer literacy and curiosity about how computers work. No prior repair experience is required.",
          },
          {
            title: "Why learn computer hardware and software maintenance?",
            body: "Every home, school, and office relies on working computers. Technicians who can diagnose and fix hardware and software issues are always in demand.",
          },
          {
            title: "Why study at HassAz Tech Hub?",
            body: "Hands-on lab practice with real components and machines, mentor-led troubleshooting sessions, and practical assessments, not theory alone.",
          },
        ],
        curriculum: [
          {
            title: "Computer hardware fundamentals",
            items: ["Computer components and assembly", "Motherboards, CPUs, RAM, and storage", "Power supplies and cooling"],
          },
          {
            title: "Diagnostics & repair",
            items: ["Hardware fault diagnosis", "Common repair procedures", "Preventive maintenance routines"],
          },
          {
            title: "Operating systems & software",
            items: ["OS installation and configuration", "Software installation and troubleshooting", "Data backup and recovery basics"],
          },
          {
            title: "Networking & practical projects",
            items: ["Basic networking and peripherals setup", "Customer service for technicians", "Hands-on maintenance projects"],
          },
        ],
        modes: [ftInPerson(10), ptRemote(12)],
      },
      careerProgram(
        "computer-package",
        "Computer Package",
        "Core computer skills for office work: documents, spreadsheets, presentations, and internet use.",
        "Build confidence with the computer tools used in schools, offices, and small businesses, from typing and files to Word, Excel, PowerPoint, email, and internet safety.",
        ["Office Assistant", "Data Entry", "Administrative support"],
        ["Computer fundamentals", "Microsoft Word, Excel, and PowerPoint", "Email, internet, and file management"]
      ),
      careerProgram(
        "frontend-developer",
        "Frontend Developer",
        "Build the user-facing side of websites and web applications.",
        "Learn HTML, CSS, JavaScript, and modern UI practice so you can turn designs into fast, accessible websites that work on phones and desktops.",
        ["Frontend Developer", "Web Developer", "UI Implementer"],
        ["HTML, CSS, and responsive layouts", "JavaScript and the DOM", "Components, forms, and consuming APIs"]
      ),
      careerProgram(
        "backend-developer",
        "Backend Developer",
        "Build APIs, databases, and the server logic behind web applications.",
        "Learn how servers, databases, and authentication work so you can create reliable APIs and store data safely for real products.",
        ["Backend Developer", "API Developer", "Junior Software Engineer"],
        ["Server-side programming", "Databases and data modeling", "APIs, authentication, and deployment basics"]
      ),
    ],
  },
  {
    slug: "data-courses",
    title: "Data Courses",
    summary:
      "Learn in-demand data skills and become a data expert, from analysis and visualization to data science, AI, and machine learning.",
    programs: [
      {
        slug: "data-science-bootcamp",
        title: "Data Science Bootcamp",
        summary: "From messy datasets to models and stories that teams can act on.",
        headline: "Turn data into decisions",
        intro:
          "Work through analysis, visualization, and applied machine learning with Kenya-relevant and general business cases. Finish with a capstone you can present.",
        careers: ["Data Analyst", "Junior Data Scientist", "Business Intelligence Associate"],
        details: [
          {
            title: "Who is this course for?",
            body: "Graduates and professionals who want a career in data, analytics, or applied ML.",
          },
          {
            title: "What are the course prerequisites?",
            body: "Secondary-school maths comfort and a laptop. Programming is taught from first principles.",
          },
        ],
        curriculum: [
          {
            title: "Data wrangling",
            items: ["Python for data", "Cleaning and joining tables", "Exploratory analysis"],
          },
          {
            title: "Insight & models",
            items: ["Visualization", "Introductory machine learning", "Communicating findings"],
          },
        ],
        modes: [ftHybrid(24), ftRemote(24), ptRemote(32)],
      },
      {
        slug: "introduction-to-data-science",
        title: "Introduction to Data Science",
        summary: "A shorter path into data thinking, Python basics, and first analyses.",
        headline: "Get started with data science",
        intro: "Learn how data projects work and complete guided notebooks that build confidence for a longer bootcamp.",
        careers: ["Data Intern", "Reporting Assistant"],
        details: [
          {
            title: "Who is this course for?",
            body: "Beginners exploring data careers and professionals who need literacy in data workflows.",
          },
        ],
        curriculum: [
          {
            title: "First analyses",
            items: ["Tables and metrics", "Python notebooks", "A short insight project"],
          },
        ],
        modes: [ftRemote(10), ptRemote(12)],
      },
      {
        slug: "data-analytics",
        title: "Data Analytics",
        summary: "Spreadsheets, dashboards, and the questions businesses actually ask.",
        headline: "Analyse data teams can use this week",
        intro: "Focus on practical analytics: Excel/Sheets, SQL basics, and dashboards that answer operational questions.",
        careers: ["Data Analyst", "Operations Analyst"],
        details: [
          {
            title: "Who is this course for?",
            body: "Office professionals, graduates, and entrepreneurs who need to report and decide with data.",
          },
        ],
        curriculum: [
          {
            title: "Analytics toolkit",
            items: ["Spreadsheet modelling", "Introductory SQL", "Dashboard storytelling"],
          },
        ],
        modes: [ptRemote(12)],
      },
      {
        slug: "business-intelligence",
        title: "Business Intelligence",
        summary: "Design reports and BI workflows that leadership can trust.",
        headline: "Build a reliable BI practice",
        intro: "Learn how to model metrics, design dashboards, and keep reporting consistent across a team.",
        careers: ["BI Analyst", "Reporting Specialist"],
        details: [
          {
            title: "Who is this course for?",
            body: "Analysts and managers who own reporting, KPIs, or departmental dashboards.",
          },
        ],
        curriculum: [
          {
            title: "BI delivery",
            items: ["Metric definitions", "Dashboard design", "Stakeholder reviews"],
          },
        ],
        modes: [ptRemote(10)],
      },
    ],
  },
  {
    slug: "cyber-security",
    title: "Cyber Security",
    summary: "Your journey to becoming a cybersecurity expert starts here, beginner to advanced training available.",
    programs: [
      {
        slug: "introduction-to-cybersecurity",
        title: "Introduction to Cybersecurity",
        summary: "Foundations of threats, defence, and safe practice for individuals and organisations.",
        headline: "Start your cybersecurity career with confidence",
        intro:
          "Learn how attacks happen, how defenders think, and the core skills behind networking, systems, and security hygiene. Labs keep the learning practical.",
        careers: ["Security Awareness Champion", "Junior SOC intern track"],
        details: [
          {
            title: "What is cybersecurity?",
            body: "Cybersecurity is the practice of protecting systems, networks, and data from unauthorized access, disruption, and damage, across people, process, and technology.",
          },
          {
            title: "Who is this course for?",
            body: "Beginners, IT support staff, and professionals who need a solid security foundation.",
          },
          {
            title: "What are the course prerequisites?",
            body: "Basic computer literacy. Prior networking knowledge is helpful but not required.",
          },
          {
            title: "Why learn cybersecurity?",
            body: "Every organisation that uses digital systems needs people who can reduce risk and respond when something goes wrong.",
          },
          {
            title: "Why study at HassAz Tech Hub?",
            body: "Hands-on labs, mentor feedback, and a pathway from this introduction into the full Cybersecurity Bootcamp.",
          },
        ],
        curriculum: [
          {
            title: "Security mindset",
            items: ["Threats and risk", "Ethics and responsible disclosure", "Password and identity basics"],
          },
          {
            title: "Systems & networks",
            items: ["OS fundamentals", "Network concepts", "Common attack patterns at a high level"],
          },
        ],
        modes: [ftRemote(8), ptRemote(12)],
      },
      {
        slug: "cybersecurity-bootcamp",
        title: "Cybersecurity Bootcamp",
        summary: "Hands-on labs and a capstone toward analyst, SOC, and testing-adjacent roles.",
        headline: "Launch your cybersecurity career with confidence",
        intro:
          "A comprehensive, hands-on program covering networking, operating systems, scripting, system hardening, monitoring, and introductory penetration testing. You will complete labs and a capstone you can discuss in interviews.",
        careers: ["Cybersecurity Analyst", "SOC Analyst", "Junior Penetration Tester"],
        details: [
          {
            title: "What is cybersecurity?",
            body: "It is the discipline of defending digital assets, identifying weaknesses, monitoring for threats, and responding when incidents occur.",
          },
          {
            title: "Who is this course for?",
            body: "Committed beginners and IT professionals ready for an intensive, lab-heavy bootcamp.",
          },
          {
            title: "What are the course prerequisites?",
            body: "A reliable laptop, weekday study hours, and completion of (or equivalent to) our Introduction to Cybersecurity is recommended.",
          },
          {
            title: "Why learn cybersecurity?",
            body: "Demand continues for people who can protect organisations in Kenya and globally, from analysis to hands-on defence.",
          },
          {
            title: "Why study at HassAz Tech Hub?",
            body: "Project-based labs, mentor-led classes, and career studio time for resumes, portfolios, and interview practice.",
          },
        ],
        curriculum: [
          {
            title: "Onboarding & environment",
            items: ["Lab setup", "Course roadmap", "Accounts, tools, and safe lab rules"],
          },
          {
            title: "Cybersecurity essentials",
            items: [
              "Security principles and ethics",
              "Python for security tasks",
              "Operating systems and networking fundamentals",
            ],
          },
          {
            title: "Career studio I",
            items: ["Resume and LinkedIn", "Lab documentation habits", "Portfolio skeleton"],
          },
          {
            title: "Foundations I",
            items: ["System hardening", "Threat intelligence intro", "SIEM and hunting basics", "Labs and quizzes"],
          },
          {
            title: "Foundations II",
            items: [
              "Security architecture concepts",
              "Incident response lifecycle",
              "Vulnerability and assessment workflow",
              "Web assessment intro",
            ],
          },
          {
            title: "Career studio II",
            items: ["Interview coaching", "Mock interviews", "Portfolio polish"],
          },
          {
            title: "Capstone",
            items: ["End-to-end project", "Capstone labs", "Summative assessment"],
          },
        ],
        modes: [ftRemote(24), ptRemote(32)],
      },
      careerProgram(
        "networking",
        "Networking",
        "Understand how computers connect, share data, and stay reachable on a network.",
        "Cover network devices, IP addressing, cabling, wireless, troubleshooting, and the foundations used in IT support and infrastructure roles.",
        ["Network Technician", "IT Support", "Infrastructure Assistant"],
        ["Network models and devices", "IP addressing and routing basics", "Cabling, wireless, and troubleshooting"]
      ),
    ],
  },
  {
    slug: "ai",
    title: "AI",
    summary: "Practical AI for learning, work, and building, from essentials to applied engineering.",
    programs: [
      {
        slug: "ai-for-learning",
        title: "AI for Learning",
        summary: "Use AI tools responsibly to study, research, and produce better academic and workplace work.",
        headline: "Learn faster with AI without losing your own thinking",
        intro:
          "An in-person program on prompting, verification, academic integrity, and everyday workflows with AI assistants.",
        careers: ["Knowledge worker upskilling", "Student productivity"],
        details: [
          {
            title: "Who is this course for?",
            body: "Students, teachers, and professionals who want structured, ethical AI use in learning and work.",
          },
        ],
        curriculum: [
          {
            title: "AI in the classroom and office",
            items: ["Prompt patterns", "Checking outputs", "Citation and integrity"],
          },
        ],
        modes: [ftInPerson(6)],
      },
      {
        slug: "generative-ai-essentials",
        title: "Generative AI Essentials",
        summary: "Core skills for generating text, images, and workflows with modern generative tools.",
        headline: "Get fluent with generative AI",
        intro: "Practice high-quality prompting, evaluation, and simple automations you can reuse at work.",
        careers: ["AI-enabled operations", "Content and knowledge roles"],
        details: [
          {
            title: "Who is this course for?",
            body: "Professionals and graduates who will use generative AI in daily work.",
          },
        ],
        curriculum: [
          {
            title: "Generate, evaluate, iterate",
            items: ["Text and image tools", "Quality checks", "Team usage guidelines"],
          },
        ],
        modes: [ptRemote(8)],
      },
      {
        slug: "ai-agents-and-workflow-automation",
        title: "AI Agents and Workflow Automation – No Code",
        summary: "Connect tools and agents to automate repetitive work without writing production software.",
        headline: "Automate work with no-code AI agents",
        intro: "Design simple agents and automations: triggers, tools, human approval, and monitoring.",
        careers: ["Operations automation", "No-code builder"],
        details: [
          {
            title: "Who is this course for?",
            body: "Operators, founders, and analysts who want automation without a full engineering bootcamp.",
          },
        ],
        curriculum: [
          {
            title: "Agents & flows",
            items: ["Use-case mapping", "No-code builders", "Guardrails and handoff to humans"],
          },
        ],
        modes: [ftRemote(8), ptRemote(10)],
      },
      {
        slug: "digital-marketing-with-ai",
        title: "Digital Marketing with AI",
        summary: "Plan campaigns, content, and measurement with AI as a teammate, not a replacement for strategy.",
        headline: "Market smarter with AI-assisted workflows",
        intro: "Cover research, content drafts, channel planning, and analytics with human review at each step.",
        careers: ["Digital marketing associate", "Content operations"],
        details: [
          {
            title: "Who is this course for?",
            body: "Marketers, entrepreneurs, and communicators who want practical AI in their toolkit.",
          },
        ],
        curriculum: [
          {
            title: "Campaign loop",
            items: ["Audience research", "Content systems", "Measurement basics"],
          },
        ],
        modes: [ptRemote(8)],
      },
      {
        slug: "applied-ai-engineering",
        title: "Applied AI Engineering",
        summary: "Build reliable AI features: retrieval, evaluation, and production-minded design.",
        headline: "Engineer AI features that hold up in production",
        intro:
          "Go beyond chat demos. Learn how to ground models, evaluate quality, and ship AI-assisted features with care.",
        careers: ["Applied AI Engineer", "ML-adjacent developer"],
        details: [
          {
            title: "Who is this course for?",
            body: "Developers and technical professionals ready to implement AI inside products.",
          },
          {
            title: "What are the course prerequisites?",
            body: "Programming comfort (Python or JavaScript) and basic API use.",
          },
        ],
        curriculum: [
          {
            title: "Applied stack",
            items: ["Model APIs", "Retrieval basics", "Evaluation and safety"],
          },
        ],
        modes: [ptRemote(16)],
      },
      {
        slug: "advanced-llms",
        title: "Advanced LLMs",
        summary: "Deeper work on prompting systems, fine-tuning concepts, and evaluation for large language models.",
        headline: "Go deeper on large language models",
        intro: "For learners who already use LLMs and want stronger technical control: context, tools, and evaluation.",
        careers: ["AI specialist", "Technical product roles"],
        details: [
          {
            title: "Who is this course for?",
            body: "Practitioners who completed Applied AI Engineering or equivalent experience.",
          },
        ],
        curriculum: [
          {
            title: "Advanced techniques",
            items: ["Tool use and agents", "Evaluation harnesses", "Cost and latency trade-offs"],
          },
        ],
        modes: [ptRemote(12)],
      },
    ],
  },
  {
    slug: "dpo",
    title: "DPO",
    summary:
      "Gain the expertise needed to ensure legal compliance, safeguard sensitive data, and build trust by implementing effective data protection and privacy practices within your organization.",
    programs: [
      {
        slug: "certified-data-protection-officer",
        title: "Certified Data Protection Officer Course",
        summary: "Practical DPO skills for compliance, governance, and privacy operations.",
        headline: "Protect people and data with a working DPO practice",
        intro:
          "Learn how to map processing, run DPIAs, handle requests, and advise leadership, with Kenya and international privacy principles in view.",
        careers: ["Data Protection Officer", "Privacy analyst", "Compliance support"],
        details: [
          {
            title: "Who is this course for?",
            body: "Compliance, legal, IT, and HR professionals who will own or support data protection.",
          },
          {
            title: "What are the course prerequisites?",
            body: "Work experience in an organisation is helpful. Legal training is not required.",
          },
        ],
        curriculum: [
          {
            title: "Privacy operations",
            items: ["Principles and lawful bases", "Records of processing", "Rights requests and incidents"],
          },
          {
            title: "Governance",
            items: ["Policies and training", "Vendor diligence", "Working with leadership"],
          },
        ],
        modes: [selfPaced(12), partTime(10)],
      },
      careerProgram(
        "digital-marketing",
        "Digital Marketing",
        "Plan campaigns, content, social media, and measurement for real businesses.",
        "Learn how to research an audience, create content, run digital campaigns, and read results so you can market products and services online.",
        ["Digital Marketing Associate", "Social Media Coordinator", "Content Marketer"],
        ["Marketing fundamentals", "Social media and content", "Ads, SEO basics, and analytics"]
      ),
    ],
  },
  {
    slug: "high-school-bootcamp",
    title: "High School Bootcamp",
    summary:
      "Our immersive, hands-on coding bootcamp is your chance to learn real coding skills, build exciting projects, and explore the coolest careers in technology.",
    programs: [
      {
        slug: "high-school-holiday-tech-bootcamp",
        title: "High School Holiday Tech Bootcamp",
        summary: "Holiday coding and tech exploration with two challenge tiers.",
        headline: "Build, play, and discover tech careers",
        intro:
          "A supervised holiday program for high schoolers. Pathfinder is the first tier. Trailblazer goes further with a bigger project and more independence.",
        careers: ["Informed subject choices", "First portfolio project"],
        details: [
          {
            title: "Who is this course for?",
            body: "High school students who want a serious but age-appropriate introduction to building with code.",
          },
          {
            title: "What are the course prerequisites?",
            body: "A laptop where possible, parental/guardian consent, and curiosity. Pathfinder has no coding prerequisite.",
          },
        ],
        curriculum: [
          {
            title: "Pathfinder track",
            items: ["Computational thinking", "First websites or scripts", "Showcase day"],
          },
          {
            title: "Trailblazer track",
            items: ["Deeper project", "Team collaboration", "Career talks"],
          },
        ],
        modes: [
          mode(
            "pathfinder",
            "Pathfinder (Tier 1)",
            "2 Weeks",
            "Holiday daytime sessions | beginner track"
          ),
          mode(
            "trailblazer",
            "Trailblazer (Tier 2)",
            "3 Weeks",
            "Holiday daytime sessions | project track"
          ),
        ],
      },
    ],
  },
];

const courseImages = {
  "software-engineering":
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80",
  "full-stack-software-engineering-bootcamp":
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
  "introduction-to-software-engineering":
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1400&q=80",
  "introduction-to-devops-engineering":
    "https://images.unsplash.com/photo-1667372393119-3d4c09d00fcb?auto=format&fit=crop&w=1400&q=80",
  "aws-devops-engineering-bootcamp":
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80",
  "computer-software-and-hardware-maintenance":
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
  "data-courses":
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
  "data-science-bootcamp":
    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1400&q=80",
  "introduction-to-data-science":
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
  "data-analytics":
    "https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1400&q=80",
  "business-intelligence":
    "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1400&q=80",
  "cyber-security":
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=80",
  "introduction-to-cybersecurity":
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80",
  "cybersecurity-bootcamp":
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1400&q=80",
  ai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80",
  "ai-for-learning":
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=80",
  "generative-ai-essentials":
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1400&q=80",
  "ai-agents-and-workflow-automation":
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1400&q=80",
  "digital-marketing-with-ai":
    "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1400&q=80",
  "applied-ai-engineering":
    "https://images.unsplash.com/photo-1677756119517-756a188d2d94?auto=format&fit=crop&w=1400&q=80",
  "advanced-llms":
    "https://images.unsplash.com/photo-1655720828018-edd2daec9349?auto=format&fit=crop&w=1400&q=80",
  dpo: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80",
  "certified-data-protection-officer":
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1400&q=80",
  "high-school-bootcamp":
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
  "high-school-holiday-tech-bootcamp":
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=80",
  "digital-marketing":
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
  "computer-package":
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
  "frontend-developer":
    "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?auto=format&fit=crop&w=1400&q=80",
  "backend-developer":
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80",
  networking:
    "https://images.unsplash.com/photo-1544197150-b99a5804f08b?auto=format&fit=crop&w=1400&q=80",
};

function attachImages(list) {
  return list.map((category) => ({
    ...category,
    image: courseImages[category.slug],
    programs: category.programs.map((program) => ({
      ...program,
      image: courseImages[program.slug] || courseImages[category.slug],
    })),
  }));
}

export const catalog = attachImages(catalogData);

export function flattenPrograms(list = catalog) {
  return list.flatMap((category) =>
    category.programs.map((program) => ({
      ...program,
      category: category.title,
      categorySlug: category.slug,
      href: `/courses/${category.slug}/${program.slug}`,
    }))
  );
}

export const courses = flattenPrograms();

export function getCategory(slug, list = catalog) {
  return list.find((item) => item.slug === slug);
}

export function getProgram(categorySlug, programSlug, list = catalog) {
  const category = getCategory(categorySlug, list);
  if (!category) return null;
  const program = category.programs.find((item) => item.slug === programSlug);
  if (!program) return null;
  return { category, program };
}
