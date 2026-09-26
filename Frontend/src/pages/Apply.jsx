import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { gradeAssessment, getQuiz, QUIZ_MAX_ATTEMPTS, QUIZ_PASS_MARK } from "../data/applicationQuizzes";
import { site } from "../data/site";
import { useCatalog } from "../hooks/useContent";
import { fetchApplicationWindow, fetchIntakes, submitApplication } from "../services/api";
import { clearApplyDraft, loadApplyDraft, saveApplyDraft } from "../utils/applyDraft";
import Countdown from "../components/ui/Countdown";
import PageLoader from "../components/ui/PageLoader";

const inputClass =
  "w-full rounded-full border border-navy/20 bg-white px-5 py-3 text-sm text-ink outline-none transition focus:border-gold";
const goldBtn =
  "rounded-full bg-gold px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60";
const ghostBtn =
  "rounded-full border border-navy/15 px-8 py-3 text-sm font-semibold text-navy hover:border-navy/30";

const KENYAN_COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay",
  "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii",
  "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera",
  "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru", "Nandi",
  "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River",
  "Tharaka-Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
  "Outside Kenya",
];

const COUNTRIES = [
  "Kenya", "Uganda", "Tanzania", "Somalia", "Ethiopia", "South Sudan",
  "Rwanda", "Burundi", "Nigeria", "Ghana", "Other",
];

const emptyForm = {
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  nationality: "Kenyan",
  phone: "",
  email: "",
  county: "",
  location: "Kenya",
  educationLevel: "",
  currentStatus: "",
  categorySlug: "",
  programSlug: "",
  modeId: "",
  source: "",
  availableForDuration: "",
  paymentMethod: "",
  installmentMethod: "",
  hasLaptop: "",
  preferredClassDays: "",
  processingConsent: false,
};

const emptyQuiz = {
  answers: {},
  attempt: 1,
  lastScore: null,
  lastPassed: false,
  readyToSubmit: false,
  result: null,
  scores: [],
};

function splitName(fullName = "") {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function hydrateForm(params, draft) {
  const urlCategory = params.get("category") || "";
  const urlProgram = params.get("program") || "";
  const urlMode = params.get("mode") || "";
  const base = { ...emptyForm };
  if (!draft?.form) {
    return { ...base, categorySlug: urlCategory, programSlug: urlProgram, modeId: urlMode };
  }
  const previous = { ...base, ...draft.form };
  if (previous.fullName && !previous.firstName) {
    Object.assign(previous, splitName(previous.fullName));
  }
  const courseChanged =
    (urlCategory && urlCategory !== previous.categorySlug) ||
    (urlProgram && urlProgram !== previous.programSlug);
  return {
    ...previous,
    categorySlug: urlCategory || previous.categorySlug,
    programSlug: urlProgram || previous.programSlug,
    modeId: urlMode || previous.modeId,
    _courseChanged: courseChanged,
  };
}

function hydrateQuiz(draft, courseChanged) {
  if (courseChanged || !draft?.quiz) return { ...emptyQuiz };
  return { ...emptyQuiz, ...draft.quiz };
}

export default function Apply() {
  const catalogData = useCatalog();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const draftRef = useRef(null);
  if (draftRef.current === null) draftRef.current = loadApplyDraft();
  const draft = draftRef.current;

  const seeded = useMemo(() => {
    const form = hydrateForm(params, draft);
    const courseChanged = Boolean(form._courseChanged);
    delete form._courseChanged;
    return {
      form,
      step: courseChanged ? 0 : Math.min(Number(draft?.step) || 0, 5),
      quiz: hydrateQuiz(draft, courseChanged),
    };
  }, [params, draft]);

  const [step, setStep] = useState(seeded.step);
  const [form, setForm] = useState(seeded.form);
  const [quiz, setQuiz] = useState(seeded.quiz);
  const [status, setStatus] = useState("");
  const [statusTitle, setStatusTitle] = useState("");
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [window_, setWindow_] = useState(null);
  const [checkingWindow, setCheckingWindow] = useState(true);
  const [intakeOffers, setIntakeOffers] = useState([]);
  const [inProgress, setInProgress] = useState(Boolean(draft));
  const [resumed] = useState(() => Boolean(draft && (draft.step > 0 || draft.form?.firstName || draft.form?.email)));

  const urlCategory = params.get("category") || "";
  const urlProgram = params.get("program") || "";

  const refreshWindow = useCallback(() => {
    return fetchApplicationWindow({
      category: urlCategory || form.categorySlug,
      program: urlProgram || form.programSlug,
    })
      .then((data) => {
        if (!data) return;
        setWindow_((current) => {
          const wasOpen = current && (current.anyOpen || current.resolved?.isOpen || current.globalOpen);
          const nowClosed = !data.anyOpen && !data.resolved?.isOpen && !data.globalOpen;
          if (inProgress && wasOpen && nowClosed) return current;
          return data;
        });
      })
      .catch(() => {});
  }, [urlCategory, urlProgram, form.categorySlug, form.programSlug, inProgress]);

  useEffect(() => {
    refreshWindow().finally(() => setCheckingWindow(false));
    const id = setInterval(refreshWindow, 15000);
    return () => clearInterval(id);
  }, [refreshWindow]);

  useEffect(() => {
    fetchIntakes()
      .then((data) => setIntakeOffers(data.offers || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (result) return;
    const timer = setTimeout(() => {
      saveApplyDraft({ step, form, quiz });
    }, 120);
    return () => clearTimeout(timer);
  }, [step, form, quiz, result]);

  const category = catalogData.find((item) => item.slug === form.categorySlug);
  const program = category?.programs.find((item) => item.slug === form.programSlug);
  const programModes = useMemo(() => {
    const fromIntake = intakeOffers.filter(
      (item) =>
        item.programSlug === form.programSlug &&
        (!form.categorySlug || !item.categorySlug || item.categorySlug === form.categorySlug)
    );
    if (fromIntake.length) {
      return fromIntake.map((item) => ({
        id: item.modeId || item.id,
        label: item.label,
        duration: item.duration,
        schedule: item.schedule,
        fee: item.fee,
      }));
    }
    return program?.modes || [];
  }, [intakeOffers, form.programSlug, form.categorySlug, program]);
  const mode = programModes.find((item) => item.id === form.modeId) || programModes[0];
  const quizBank = useMemo(
    () => getQuiz(form.categorySlug, form.programSlug),
    [form.categorySlug, form.programSlug]
  );
  const durationLabel = mode?.duration || program?.modes?.[0]?.duration || "the full course";

  function setField(name, value) {
    setInProgress(true);
    setForm((current) => ({ ...current, [name]: value }));
  }

  function go(nextStep) {
    setStatus("");
    setStatusTitle("");
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validate() {
    if (step === 0 && (!form.categorySlug || !form.programSlug)) {
      return "Please choose the course you want to apply for.";
    }
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.phone || !form.gender || !form.dateOfBirth) {
        return "Please complete the required contact details.";
      }
      if (!form.processingConsent) {
        return "Please confirm the data-protection consent to continue.";
      }
    }
    if (step === 2) {
      if (!form.email || !form.source || !form.location || !form.educationLevel || !form.currentStatus) {
        return "Please complete the required background details.";
      }
      if (form.location === "Kenya" && !form.county) {
        return "Please choose your home county.";
      }
    }
    if (step === 3) {
      if (
        !form.availableForDuration ||
        !form.paymentMethod ||
        !form.installmentMethod ||
        !form.hasLaptop ||
        !form.preferredClassDays
      ) {
        return "Please complete the fee and readiness questions.";
      }
      if (window_ && !courseWindowOpen(window_, form.categorySlug, form.programSlug)) {
        return "That course is not open for application. Choose an open course or contact the Academic Director.";
      }
    }
    if (step === 5) {
      const unanswered = quizBank.questions.some((item) => quiz.answers[item.id] == null);
      if (unanswered) return "Please answer every question before submitting the assessment.";
    }
    return "";
  }

  async function sendApplication(assessment) {
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    return submitApplication({
      personalInformation: {
        fullName,
        firstName: form.firstName,
        lastName: form.lastName,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        nationality: form.nationality,
      },
      contactInformation: {
        phone: form.phone,
        whatsapp: form.phone,
        email: form.email,
        county: form.county,
        town: form.county,
        country: form.location,
      },
      education: {
        level: form.educationLevel,
        status: form.currentStatus,
      },
      program: {
        category: category?.title,
        categorySlug: form.categorySlug,
        program: program?.title,
        programSlug: form.programSlug,
        mode: mode?.label,
        modeId: mode?.id || form.modeId,
      },
      technologyBackground: {
        computerAccess: form.hasLaptop === "Yes" ? "Yes" : "Limited",
        skillLevel: "To be confirmed in class",
      },
      experience: {
        currentlyWorking: /employ/i.test(form.currentStatus) ? "Yes" : "No",
        occupation: form.currentStatus,
      },
      goals: {
        whyStudy: `Application for ${program?.title || "HIACDI Tech Hub"}`,
      },
      trainingPreferences: {
        availableForDuration: form.availableForDuration,
        paymentMethod: form.paymentMethod,
        installmentMethod: form.installmentMethod,
        hasLaptop: form.hasLaptop,
        preferredClassDays: form.preferredClassDays,
      },
      source: form.source,
      consent: {
        accuracy: true,
        processing: form.processingConsent,
      },
      assessment: {
        answers: quiz.answers,
        attempts: assessment?.attempts || quiz.attempt,
      },
    });
  }

  function currentAssessment(assessment) {
    return (
      assessment ||
      quiz.result ||
      gradeAssessment({
        categorySlug: form.categorySlug,
        programSlug: form.programSlug,
        answers: quiz.answers,
        attempts: quiz.attempt,
      })
    );
  }

  async function finishApplication(assessment) {
    setSubmitting(true);
    setStatus("Submitting...");
    const graded = currentAssessment(assessment);
    try {
      const created = await sendApplication(graded);
      clearApplyDraft();
      setResult(created);
      setStatus("");
      setStatusTitle("");
    } catch (error) {
      if (error.status === 409) {
        clearApplyDraft();
        setResult({
          alreadyExists: true,
          applicationNumber: error.applicationNumber || "",
          message: error.message,
        });
        setStatus("");
        setStatusTitle("");
        return;
      }
      setQuiz((current) => ({ ...current, readyToSubmit: true, result: graded }));
      setStatusTitle(error.title || "");
      setStatus(error.message || "Could not submit the application. Your answers are saved — try again.");
      go(4);
    } finally {
      setSubmitting(false);
    }
  }

  function retakeAssessment() {
    if (quiz.attempt >= QUIZ_MAX_ATTEMPTS) return;
    setStatus("");
    setQuiz((current) => ({
      ...current,
      attempt: current.attempt + 1,
      answers: {},
      readyToSubmit: false,
    }));
    go(5);
  }

  async function next(event) {
    event.preventDefault();
    const error = validate();
    if (error) {
      setStatus(error);
      return;
    }
    setInProgress(true);

    if (step === 5) {
      const assessment = gradeAssessment({
        categorySlug: form.categorySlug,
        programSlug: form.programSlug,
        answers: quiz.answers,
        attempts: quiz.attempt,
      });
      setQuiz((current) => ({
        ...current,
        lastScore: assessment.score,
        lastPassed: assessment.passed,
        result: assessment,
        readyToSubmit: true,
        scores: [...(current.scores || []), assessment.score],
      }));
      go(4);
      return;
    }

    if (step < 5) {
      go(step + 1);
    }
  }

  if (checkingWindow) {
    return (
      <section className="relative mx-auto min-h-[40vh] max-w-2xl px-4 py-16">
        <PageLoader overlay label="Checking application status..." />
      </section>
    );
  }

  if (window_ && !result && !inProgress) {
    const targeted = Boolean(urlCategory || urlProgram || form.categorySlug);
    const closed = targeted
      ? window_.resolved && !window_.resolved.isOpen && !window_.globalOpen && !window_.anyOpen
      : !window_.anyOpen;
    if (closed) {
      return <ApplicationsClosed window={window_.resolved || window_} onReached={refreshWindow} />;
    }
  }

  return (
    <div className="min-h-screen bg-[#071428]">
      {submitting ? <PageLoader overlay label="Submitting your application..." /> : null}
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center">
            <img src="/brand/logo-icon.png?v=5" alt={site.name} className="h-10 w-auto" />
          </Link>
          <p className="text-xs font-bold tracking-[0.18em] text-navy sm:text-sm">APPLICATION FORM</p>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col lg:flex-row">
        <aside className="bg-[#071428] px-6 py-8 text-white lg:w-[300px] lg:shrink-0 lg:px-7 lg:py-10">
          <p className="text-sm font-semibold text-gold">{program?.title || "Choose a course"}</p>
          <p className="mt-4 text-sm leading-7 text-white/80">
            {program?.headline || program?.summary || "Select a HIACDI Tech Hub programme to begin."}
          </p>
          {mode?.schedule ? <p className="mt-6 text-sm leading-7 text-white/70">{mode.schedule}</p> : null}
          <p className="mt-6 text-sm font-semibold text-white">
            Tuition — {mode?.fee || "Confirmed during admissions"}
          </p>
          {resumed && !result ? (
            <p className="mt-8 rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-xs leading-5 text-white/80">
              Your previous answers were restored. Continue from where you left off.
            </p>
          ) : null}
        </aside>

        <section className="flex-1 bg-white px-5 py-8 sm:px-10 sm:py-12">
          {result ? (
            <SuccessPanel result={result} onBrowse={() => navigate("/courses")} />
          ) : (
            <form className="mx-auto max-w-2xl" onSubmit={next}>
              {step === 0 ? (
                <WelcomeStep
                  form={form}
                  catalogData={catalogData}
                  window_={window_}
                  programModes={programModes}
                  setField={setField}
                  setInProgress={setInProgress}
                />
              ) : null}
              {step === 1 ? <PersonalStep form={form} setField={setField} /> : null}
              {step === 2 ? <BackgroundStep form={form} setField={setField} /> : null}
              {step === 3 ? (
                <PaymentStep form={form} setField={setField} durationLabel={durationLabel} />
              ) : null}
              {step === 4 ? (
                <QuizGate quiz={quiz} status={status} statusTitle={statusTitle} />
              ) : null}
              {step === 5 ? (
                <QuizStep quiz={quiz} quizBank={quizBank} setQuiz={setQuiz} setInProgress={setInProgress} />
              ) : null}

              {status && step !== 4 ? <p className="mt-5 text-sm font-medium text-red-600">{status}</p> : null}

              <div className="mt-10 flex flex-wrap justify-end gap-3">
                {step > 0 && step < 4 ? (
                  <button type="button" className={ghostBtn} onClick={() => go(step - 1)}>
                    Back
                  </button>
                ) : null}
                {step === 4 && quiz.lastScore != null ? (
                  <>
                    {quiz.attempt < QUIZ_MAX_ATTEMPTS && !quiz.lastPassed ? (
                      <button type="button" className={ghostBtn} onClick={retakeAssessment}>
                        Retake assessment
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className={goldBtn}
                      disabled={submitting}
                      onClick={() => finishApplication()}
                    >
                      Submit application
                    </button>
                  </>
                ) : (
                  <button type="submit" className={goldBtn} disabled={submitting}>
                    {step === 5 ? "Submit assessment" : "Next"}
                  </button>
                )}
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

function WelcomeStep({ form, catalogData, window_, programModes, setField, setInProgress }) {
  const category = catalogData.find((item) => item.slug === form.categorySlug);
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
        A bold step toward leveling up your tech skills
      </h1>
      <p className="mt-4 text-sm leading-7 text-ink">Let’s get started on your application.</p>
      <ul className="mt-4 space-y-2 text-sm leading-7 text-ink">
        <li>✓ Check your connection (a laptop or desktop with stable internet works best)</li>
        <li>✓ Fill in your details carefully and submit</li>
        <li>✓ Complete the assessment</li>
      </ul>
      <p className="mt-5 text-sm leading-7 text-muted">
        Once you submit this form, you will receive an email on next steps for your application process. Follow
        each step carefully. Need help? Contact{" "}
        <a className="font-semibold text-gold" href={`mailto:${site.admissionsEmail}`}>
          {site.admissionsEmail}
        </a>{" "}
        for support.
      </p>
      <p className="mt-4 font-semibold text-navy">Good luck!</p>

      <h2 className="mt-10 text-xl font-semibold text-gold">Choose your course</h2>
      <div className="mt-5 grid gap-5">
        <Field label="Course area" required>
          <select
            className={inputClass}
            value={form.categorySlug}
            onChange={(event) => {
              setInProgress(true);
              setField("categorySlug", event.target.value);
              setField("programSlug", "");
              setField("modeId", "");
            }}
          >
            <option value="">Select a course area</option>
            {catalogData
              .filter((item) => !window_ || areaWindowOpen(window_, item.slug))
              .map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.title}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Programme" required>
          <select
            className={inputClass}
            value={form.programSlug}
            onChange={(event) => {
              setField("programSlug", event.target.value);
              setField("modeId", "");
            }}
          >
            <option value="">Select a programme</option>
            {(category?.programs || [])
              .filter((item) => !window_ || courseWindowOpen(window_, form.categorySlug, item.slug))
              .map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.title}
                </option>
              ))}
          </select>
        </Field>
        {programModes.length ? (
          <Field label="Training mode">
            <select className={inputClass} value={form.modeId} onChange={(event) => setField("modeId", event.target.value)}>
              <option value="">Select a training mode</option>
              {programModes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                  {item.duration ? ` · ${item.duration}` : ""}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
      </div>
    </div>
  );
}

function PersonalStep({ form, setField }) {
  return (
    <div>
      <h2 className="text-center text-xl font-semibold text-gold">1. Update contact information</h2>
      <div className="mt-8 grid gap-5">
        <Field label="First name" required>
          <input
            className={inputClass}
            placeholder="Enter your first name"
            value={form.firstName}
            onChange={(event) => setField("firstName", event.target.value)}
            autoComplete="given-name"
          />
        </Field>
        <Field label="Last name" required>
          <input
            className={inputClass}
            placeholder="Enter your last name"
            value={form.lastName}
            onChange={(event) => setField("lastName", event.target.value)}
            autoComplete="family-name"
          />
        </Field>
        <Field label="Phone number" required>
          <input
            className={inputClass}
            placeholder="Enter your phone number"
            value={form.phone}
            onChange={(event) => setField("phone", event.target.value)}
            autoComplete="tel"
          />
        </Field>
        <Field label="Gender" required>
          <select className={inputClass} value={form.gender} onChange={(event) => setField("gender", event.target.value)}>
            <option value="">Select your gender</option>
            <option>Female</option>
            <option>Male</option>
            <option>Prefer not to say</option>
          </select>
        </Field>
        <Field label="When were you born?" required>
          <input
            type="date"
            className={inputClass}
            value={form.dateOfBirth}
            onChange={(event) => setField("dateOfBirth", event.target.value)}
          />
        </Field>
        <label className="mt-2 flex items-start gap-3 text-sm leading-6 text-muted">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.processingConsent}
            onChange={(event) => setField("processingConsent", event.target.checked)}
          />
          <span>
            By submitting this form, I give HIACDI Tech Hub limited explicit consent to collect, process, and
            store my personal data for admissions, as set out in our data-protection practice and applicable
            Kenyan data-protection law.
          </span>
        </label>
      </div>
    </div>
  );
}

function BackgroundStep({ form, setField }) {
  return (
    <div>
      <h2 className="text-center text-xl font-semibold text-gold">2. Professional background</h2>
      <div className="mt-8 grid gap-5">
        <Field label="Email" required>
          <input
            type="email"
            className={inputClass}
            placeholder="Enter your email address"
            value={form.email}
            onChange={(event) => setField("email", event.target.value)}
            autoComplete="email"
          />
        </Field>
        <Field label="Where did you hear about us?" required>
          <select className={inputClass} value={form.source} onChange={(event) => setField("source", event.target.value)}>
            <option value="">Select an option</option>
            <option>Social media</option>
            <option>Friend or family</option>
            <option>Google search</option>
            <option>WhatsApp</option>
            <option>School or campus</option>
            <option>Event or career fair</option>
            <option>Other</option>
          </select>
        </Field>
        <Field label="Where are you located?" required>
          <select className={inputClass} value={form.location} onChange={(event) => setField("location", event.target.value)}>
            <option value="">Select your country</option>
            {COUNTRIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Where is your home county?" required={form.location === "Kenya"}>
          <select className={inputClass} value={form.county} onChange={(event) => setField("county", event.target.value)}>
            <option value="">Select your county</option>
            {KENYAN_COUNTIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="What is your highest level of education?" required>
          <select
            className={inputClass}
            value={form.educationLevel}
            onChange={(event) => setField("educationLevel", event.target.value)}
          >
            <option value="">Select your education level</option>
            <option>Primary school</option>
            <option>Secondary / KCSE</option>
            <option>Certificate</option>
            <option>Diploma</option>
            <option>Bachelor&apos;s degree</option>
            <option>Master&apos;s degree or higher</option>
            <option>Other</option>
          </select>
        </Field>
        <Field label="Which of the following best describes your current status?" required>
          <select
            className={inputClass}
            value={form.currentStatus}
            onChange={(event) => setField("currentStatus", event.target.value)}
          >
            <option value="">Select your current status</option>
            <option>Student</option>
            <option>Employed</option>
            <option>Self-employed</option>
            <option>Unemployed</option>
            <option>Between roles</option>
            <option>Other</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

function PaymentStep({ form, setField, durationLabel }) {
  return (
    <div>
      <h2 className="text-center text-xl font-semibold text-gold">3. Fee payment</h2>
      <div className="mt-8 grid gap-5">
        <Field label={`Are you available for the ${durationLabel} duration?`} required>
          <select
            className={inputClass}
            value={form.availableForDuration}
            onChange={(event) => setField("availableForDuration", event.target.value)}
          >
            <option value="">Select an option</option>
            <option>Yes</option>
            <option>No</option>
            <option>I need to discuss a flexible plan</option>
          </select>
        </Field>
        <Field label="Tuition is confirmed during admissions. How will you pay?" required>
          <select
            className={inputClass}
            value={form.paymentMethod}
            onChange={(event) => setField("paymentMethod", event.target.value)}
          >
            <option value="">Select an option</option>
            <option>Self-sponsored</option>
            <option>Family or guardian</option>
            <option>Employer</option>
            <option>Scholarship or sponsor</option>
            <option>Payment plan</option>
          </select>
        </Field>
        <Field label="What is your preferred method of installments?" required>
          <select
            className={inputClass}
            value={form.installmentMethod}
            onChange={(event) => setField("installmentMethod", event.target.value)}
          >
            <option value="">Select an option</option>
            <option>Pay in full</option>
            <option>Two installments</option>
            <option>Three installments</option>
            <option>Monthly plan</option>
          </select>
        </Field>
        <Field
          label="Can you access a laptop (Core i5 or similar, 8GB RAM, 256GB storage) during the course?"
          required
        >
          <select
            className={inputClass}
            value={form.hasLaptop}
            onChange={(event) => setField("hasLaptop", event.target.value)}
          >
            <option value="">Select an option</option>
            <option>Yes</option>
            <option>No — I will need guidance</option>
          </select>
        </Field>
        <Field label="Please choose your preferred in-person / live class days" required>
          <select
            className={inputClass}
            value={form.preferredClassDays}
            onChange={(event) => setField("preferredClassDays", event.target.value)}
          >
            <option value="">Select an option</option>
            <option>Monday – Wednesday</option>
            <option>Wednesday – Friday</option>
            <option>Flexible / as scheduled</option>
          </select>
        </Field>
        <p className="text-xs leading-5 text-muted">
          Final placement depends on seat availability and is confirmed after the admissions team reviews your
          application.
        </p>
      </div>
    </div>
  );
}

function QuizGate({ quiz, status, statusTitle }) {
  const canRetake = quiz.lastScore != null && quiz.attempt < QUIZ_MAX_ATTEMPTS && !quiz.lastPassed;
  return (
    <div className="py-6 text-center">
      {quiz.lastScore == null ? (
        <>
          <p className="text-sm leading-7 text-ink">
            Congratulations! You have completed the first stage of your application. You have one remaining
            step to finish your application journey.
          </p>
          <p className="mt-4 text-sm leading-7 text-ink">
            Kindly click Next below to take the application assessment.
          </p>
          <p className="mt-8 text-sm font-semibold text-navy">
            Attempt: {quiz.attempt} out of {QUIZ_MAX_ATTEMPTS}
          </p>
        </>
      ) : (
        <>
          <p className="text-lg font-semibold text-navy">
            Assessment score: {quiz.lastScore}% {quiz.lastPassed ? "(passed)" : ""}
          </p>
          <p className="mt-2 text-sm text-ink">
            Attempt {quiz.attempt} of {QUIZ_MAX_ATTEMPTS}. The pass mark is {QUIZ_PASS_MARK}%.
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
            {canRetake
              ? "You can submit your application now, or retake the assessment to improve your score."
              : "Click Submit application below to finish. Your score will be sent with the application."}
          </p>
        </>
      )}
      {statusTitle ? <p className="mt-6 text-sm font-semibold text-navy">{statusTitle}</p> : null}
      {status ? <p className="mt-2 text-sm font-medium text-red-600">{status}</p> : null}
    </div>
  );
}

function QuizStep({ quiz, quizBank, setQuiz, setInProgress }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gold">{quizBank.title}</h2>
      <p className="mt-2 text-sm text-muted">{quizBank.subtitle}</p>
      <div className="mt-8 space-y-6">
        {quizBank.questions.map((item) => (
          <fieldset key={item.id} className="rounded-2xl border border-gold/40 p-5">
            <legend className="px-1 text-sm font-semibold text-navy">{item.prompt}</legend>
            <div className="mt-3 space-y-3">
              {item.options.map((option, index) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-3 rounded-full border px-4 py-3 text-sm ${
                    quiz.answers[item.id] === index ? "border-gold bg-gold/5" : "border-navy/15"
                  }`}
                >
                  <input
                    type="radio"
                    name={item.id}
                    checked={quiz.answers[item.id] === index}
                    onChange={() => {
                      setInProgress(true);
                      setQuiz((current) => ({
                        ...current,
                        answers: { ...current.answers, [item.id]: index },
                      }));
                    }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}

function SuccessPanel({ result, onBrowse }) {
  const already = Boolean(result?.alreadyExists);
  return (
    <div className="mx-auto max-w-xl py-10 text-center">
      <h1 className="font-heading text-3xl font-bold text-navy sm:text-4xl">
        {already ? "Your application is already with us" : "You have successfully completed your application"}
      </h1>
      <p className="mt-6 text-sm leading-7 text-muted">
        {already
          ? result.message ||
            "An application with this email or phone number is already on file. Our team will contact you with the next steps."
          : "You will receive a confirmation email with more details shortly. Kindly note that tuition payments made to HIACDI Tech Hub are non-refundable and non-transferable."}
      </p>
      {result?.applicationNumber ? (
        <p className="mt-3 text-sm font-semibold text-navy">Application number: {result.applicationNumber}</p>
      ) : null}
      <p className="mt-4 text-sm text-ink">Thank you.</p>
      <p className="mt-2 text-sm font-semibold text-navy">HIACDI Tech Hub</p>
      <button type="button" className={`${goldBtn} mt-8`} onClick={onBrowse}>
        Browse all courses
      </button>
    </div>
  );
}

function ApplicationsClosed({ window: appWindow, onReached }) {
  const opensAt = appWindow.reason === "not-yet-open" && appWindow.openAt ? new Date(appWindow.openAt) : null;
  const closedAt = appWindow.reason === "closed" && appWindow.closeAt ? new Date(appWindow.closeAt) : null;

  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-sm font-semibold text-gold">Course applications</p>
      <h1 className="font-heading mt-2 text-3xl font-bold text-navy">
        No application windows that are open, Kindly Contact Academic Director For HIACDI Tech Hub
      </h1>
      {opensAt ? (
        <>
          <p className="mt-4 text-sm leading-6 text-muted">
            The next application window opens on{" "}
            <span className="font-semibold text-navy">
              {opensAt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} at{" "}
              {opensAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </span>
            .
          </p>
          <div className="mt-6 flex justify-center">
            <Countdown target={appWindow.openAt} className="text-navy" onReached={onReached} />
          </div>
        </>
      ) : closedAt ? (
        <p className="mt-4 text-sm leading-6 text-muted">
          The application window closed on{" "}
          <span className="font-semibold text-navy">
            {closedAt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </span>
          .
        </p>
      ) : (
        <p className="mt-4 text-sm leading-6 text-muted">
          We are not accepting applications right now. Please check back soon or reach out to us for the next
          intake date.
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/contact" className={goldBtn}>
          Contact us
        </Link>
        <Link to="/courses" className={ghostBtn}>
          View courses
        </Link>
      </div>
    </section>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-navy">
        {required ? "* " : ""}
        {label}
      </span>
      {children}
    </label>
  );
}

function courseWindowOpen(win, categorySlug, programSlug) {
  if (!win) return false;
  if (win.globalOpen) return true;
  const area = (win.catalog || []).find((item) => item.slug === categorySlug);
  if (!area) return false;
  if (area.isOpen) return true;
  return Boolean(area.courses?.find((item) => item.slug === programSlug)?.isOpen);
}

function areaWindowOpen(win, categorySlug) {
  if (!win) return false;
  if (win.globalOpen) return true;
  const area = (win.catalog || []).find((item) => item.slug === categorySlug);
  if (!area) return false;
  return area.isOpen || Boolean(area.courses?.some((item) => item.isOpen));
}
