import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ApplicationSuccessDialog from "../components/ui/ApplicationSuccessDialog";
import Countdown from "../components/ui/Countdown";
import PageLoader from "../components/ui/PageLoader";
import { useCatalog } from "../hooks/useContent";
import { useUserAuth } from "../context/UserAuthContext";
import { fetchApplicationWindow, fetchIntakes, submitApplication } from "../services/api";

const inputClass =
  "w-full rounded-md border border-navy/15 px-4 py-3 text-ink outline-none focus:border-gold";
const STEPS = [
  "Personal",
  "Contact",
  "Education",
  "Program",
  "Technology",
  "Goals",
  "Documents",
  "Review",
];

const emptyForm = {
  fullName: "",
  gender: "",
  dateOfBirth: "",
  nationality: "Kenyan",
  idNumber: "",
  phone: "",
  whatsapp: "",
  email: "",
  county: "",
  town: "",
  address: "",
  guardianName: "",
  guardianRelationship: "",
  guardianPhone: "",
  guardianEmail: "",
  guardianAddress: "",
  educationLevel: "",
  institutionName: "",
  studiedProgram: "",
  yearCompleted: "",
  educationStatus: "",
  categorySlug: "",
  programSlug: "",
  modeId: "",
  computerAccess: "",
  devices: [],
  skillLevel: "",
  previousTechCourse: "No",
  previousCourseName: "",
  previousInstitution: "",
  previousYear: "",
  skills: [],
  whyStudy: "",
  hopeToAchieve: "",
  careerGoals: "",
  currentlyWorking: "No",
  occupation: "",
  organization: "",
  position: "",
  hasProjects: "No",
  projectDescription: "",
  projectLink: "",
  expectations: "",
  improveArea: "",
  practicalProjects: "Yes",
  internships: "Yes",
  entrepreneurship: "No",
  extraAnswer: "",
  extraLanguages: [],
  source: "",
  sourceOther: "",
  documentsNote: "",
  accuracy: false,
  processingConsent: false,
  marketingConsent: false,
};

export default function Apply() {
  const catalogData = useCatalog();
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState("");
  const [statusTitle, setStatusTitle] = useState("");
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [window_, setWindow_] = useState(null);
  const [checkingWindow, setCheckingWindow] = useState(true);
  const [intakeOffers, setIntakeOffers] = useState([]);
  const { isLoggedIn, ready, user } = useUserAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const nextPath = `${location.pathname}${location.search}`;
  const [form, setForm] = useState({
    ...emptyForm,
    categorySlug: params.get("category") || "",
    programSlug: params.get("program") || "",
    modeId: params.get("mode") || "",
  });

  const urlCategory = params.get("category") || "";
  const urlProgram = params.get("program") || "";

  const refreshWindow = useCallback(() => {
    return fetchApplicationWindow({
      category: urlCategory,
      program: urlProgram,
    })
      .then(setWindow_)
      .catch(() => {
        // keep the last known window state on a transient network error
      });
  }, [urlCategory, urlProgram]);

  useEffect(() => {
    refreshWindow().finally(() => setCheckingWindow(false));
    const id = setInterval(refreshWindow, 5000);
    return () => clearInterval(id);
  }, [refreshWindow]);

  useEffect(() => {
    fetchIntakes()
      .then((data) => setIntakeOffers(data.offers || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      fullName: current.fullName || user.fullName || "",
      email: current.email || user.email || "",
      phone: current.phone || user.phone || "",
    }));
  }, [user]);

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
      }));
    }
    return program?.modes || [];
  }, [intakeOffers, form.programSlug, program]);
  const mode = programModes.find((item) => item.id === form.modeId);

  function set(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggle(name, value) {
    setForm((current) => {
      const list = current[name] || [];
      return {
        ...current,
        [name]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
      };
    });
  }

  function validate() {
    if (step === 0 && (!form.fullName || !form.gender || !form.dateOfBirth || !form.nationality)) {
      return "Please complete the required personal details.";
    }
    if (step === 1 && (!form.phone || !form.whatsapp || !form.email || !form.county || !form.town)) {
      return "Please complete the required contact details.";
    }
    if (step === 2 && (!form.educationLevel || !form.educationStatus)) {
      return "Please complete the required education details.";
    }
    if (step === 3 && (!form.categorySlug || !form.programSlug || !form.modeId)) {
      return "Please choose a program and training mode.";
    }
    if (step === 3 && window_ && !courseWindowOpen(window_, form.categorySlug, form.programSlug)) {
      return "That course is not open for application. Choose an open course or contact the Academic Director.";
    }
    if (step === 4 && (!form.computerAccess || !form.skillLevel)) {
      return "Please complete the technology background questions.";
    }
    if (step === 5 && (!form.whyStudy || !form.hopeToAchieve || !form.careerGoals)) {
      return "Please share your motivation and goals.";
    }
    if (step === 7 && (!form.accuracy || !form.processingConsent)) {
      return "Please confirm the declaration and consent checkboxes.";
    }
    return "";
  }

  async function next(event) {
    event.preventDefault();
    const error = validate();
    if (error) {
      setStatus(error);
      return;
    }
    setStatus("");
    if (step < STEPS.length - 1) {
      setStep((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setStatus("Submitting...");
    setSubmitting(true);
    try {
      const created = await submitApplication({
        personalInformation: {
          fullName: form.fullName,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth,
          nationality: form.nationality,
          idNumber: form.idNumber,
        },
        contactInformation: {
          phone: form.phone,
          whatsapp: form.whatsapp,
          email: form.email,
          county: form.county,
          town: form.town,
          address: form.address,
        },
        guardianInformation: {
          fullName: form.guardianName,
          relationship: form.guardianRelationship,
          phone: form.guardianPhone,
          email: form.guardianEmail,
          address: form.guardianAddress,
        },
        education: {
          level: form.educationLevel,
          institutionName: form.institutionName,
          studiedProgram: form.studiedProgram,
          yearCompleted: form.yearCompleted,
          status: form.educationStatus,
        },
        program: {
          category: category?.title,
          categorySlug: form.categorySlug,
          program: program?.title,
          programSlug: form.programSlug,
          mode: mode?.label,
          modeId: form.modeId,
        },
        technologyBackground: {
          computerAccess: form.computerAccess,
          devices: form.devices,
          skillLevel: form.skillLevel,
          previousTechCourse: form.previousTechCourse,
          previousCourseName: form.previousCourseName,
          previousInstitution: form.previousInstitution,
          previousYear: form.previousYear,
          extraAnswer: form.extraAnswer,
          extraLanguages: form.extraLanguages,
        },
        skills: form.skills,
        experience: {
          currentlyWorking: form.currentlyWorking,
          occupation: form.occupation,
          organization: form.organization,
          position: form.position,
          hasProjects: form.hasProjects,
          projectDescription: form.projectDescription,
          projectLink: form.projectLink,
        },
        goals: {
          whyStudy: form.whyStudy,
          hopeToAchieve: form.hopeToAchieve,
          careerGoals: form.careerGoals,
        },
        trainingPreferences: {
          expectations: form.expectations,
          improveArea: form.improveArea,
          practicalProjects: form.practicalProjects,
          internships: form.internships,
          entrepreneurship: form.entrepreneurship,
        },
        documents: { note: form.documentsNote },
        source: form.source === "Other" ? form.sourceOther : form.source,
        consent: {
          accuracy: form.accuracy,
          processing: form.processingConsent,
          marketing: form.marketingConsent,
        },
      });
      setResult(created);
      setStatus("");
      setStatusTitle("");
    } catch (error) {
      setStatusTitle(error.title || "");
      setStatus(error.message || "Could not submit the application.");
    } finally {
      setSubmitting(false);
    }
  }

  const extra = useMemo(() => extraPrompt(form.categorySlug), [form.categorySlug]);

  if (checkingWindow) {
    return (
      <section className="relative mx-auto min-h-[40vh] max-w-2xl px-4 py-16">
        <PageLoader overlay label="Checking application status..." />
      </section>
    );
  }

  if (window_ && !result) {
    const targeted = Boolean(urlCategory || urlProgram);
    const closed = targeted ? window_.resolved && !window_.resolved.isOpen : !window_.anyOpen;
    if (closed) {
      return <ApplicationsClosed window={window_.resolved || window_} onReached={refreshWindow} />;
    }
  }

  if (!ready) {
    return (
      <section className="relative mx-auto min-h-[40vh] max-w-2xl px-4 py-16">
        <PageLoader overlay label="Checking your account..." />
      </section>
    );
  }

  if (!isLoggedIn) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm font-semibold text-gold">Course Registration</p>
        <h1 className="font-heading mt-2 text-3xl font-bold text-navy">Please sign up or log in</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Please create an account or log in before registering for a course.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to={`/register?next=${encodeURIComponent(nextPath)}`}
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white"
          >
            Sign Up
          </Link>
          <Link
            to={`/login?next=${encodeURIComponent(nextPath)}`}
            className="rounded-full border border-navy/15 px-6 py-3 text-sm font-semibold text-navy"
          >
            Login
          </Link>
        </div>
      </section>
    );
  }

  if (result) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16">
        <ApplicationSuccessDialog open onOk={() => navigate("/courses")} />
      </section>
    );
  }

  return (
    <section className="bg-soft px-4 py-10 sm:px-6 sm:py-14">
      <div className="relative mx-auto max-w-3xl rounded-3xl bg-white p-5 shadow-sm sm:p-8">
        {submitting ? <PageLoader overlay label="Submitting your application..." /> : null}
        <p className="text-sm font-semibold text-gold">HassAz Tech Hub application</p>
        <h1 className="font-heading mt-1 text-2xl font-bold text-navy sm:text-3xl">Course application</h1>
        {window_?.closeAt ? (
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-red-600">
            <span>Applications close automatically in:</span>
            <Countdown target={window_.closeAt} className="text-red-600" onReached={refreshWindow} />
          </p>
        ) : null}
        <p className="mt-2 text-sm text-muted">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
        <div className="mt-4 flex gap-1">
          {STEPS.map((label, index) => (
            <div
              key={label}
              className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-gold" : "bg-navy/10"}`}
            />
          ))}
        </div>

        <form className="mt-8 grid gap-5" onSubmit={next}>
          {step === 0 ? (
            <>
              <Field label="Full name" required>
                <input className={inputClass} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Gender" required>
                  <select className={inputClass} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                    <option value="">Select</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Prefer not to say</option>
                  </select>
                </Field>
                <Field label="Date of birth" required>
                  <input type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
                </Field>
              </div>
              <Field label="Nationality" required>
                <input className={inputClass} value={form.nationality} onChange={(e) => set("nationality", e.target.value)} />
              </Field>
              <Field label="National ID / Passport number">
                <input className={inputClass} value={form.idNumber} onChange={(e) => set("idNumber", e.target.value)} />
              </Field>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Phone number" required>
                  <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </Field>
                <Field label="WhatsApp number" required>
                  <input className={inputClass} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
                </Field>
              </div>
              <Field label="Email address" required>
                <input type="email" className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="County" required>
                  <input className={inputClass} value={form.county} onChange={(e) => set("county", e.target.value)} />
                </Field>
                <Field label="Town / City" required>
                  <input className={inputClass} value={form.town} onChange={(e) => set("town", e.target.value)} />
                </Field>
              </div>
              <Field label="Physical address">
                <input className={inputClass} value={form.address} onChange={(e) => set("address", e.target.value)} />
              </Field>
              <p className="font-heading pt-2 text-lg font-bold text-navy">Parent / guardian (recommended for younger applicants)</p>
              <Field label="Parent / guardian full name">
                <input className={inputClass} value={form.guardianName} onChange={(e) => set("guardianName", e.target.value)} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Relationship">
                  <input className={inputClass} value={form.guardianRelationship} onChange={(e) => set("guardianRelationship", e.target.value)} />
                </Field>
                <Field label="Guardian phone">
                  <input className={inputClass} value={form.guardianPhone} onChange={(e) => set("guardianPhone", e.target.value)} />
                </Field>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Field label="Highest level of education" required>
                <select className={inputClass} value={form.educationLevel} onChange={(e) => set("educationLevel", e.target.value)}>
                  <option value="">Select</option>
                  {["Primary", "KCSE / Secondary", "Certificate", "Diploma", "Bachelor's Degree", "Master's Degree", "Other"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Institution name">
                <input className={inputClass} value={form.institutionName} onChange={(e) => set("institutionName", e.target.value)} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Course / program studied">
                  <input className={inputClass} value={form.studiedProgram} onChange={(e) => set("studiedProgram", e.target.value)} />
                </Field>
                <Field label="Year completed">
                  <input className={inputClass} value={form.yearCompleted} onChange={(e) => set("yearCompleted", e.target.value)} />
                </Field>
              </div>
              <Field label="Current education status" required>
                <select className={inputClass} value={form.educationStatus} onChange={(e) => set("educationStatus", e.target.value)}>
                  <option value="">Select</option>
                  <option>Currently studying</option>
                  <option>Completed</option>
                  <option>Not currently studying</option>
                </select>
              </Field>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <Field label="Program area" required>
                <select
                  className={inputClass}
                  value={form.categorySlug}
                  onChange={(e) => setForm((current) => ({ ...current, categorySlug: e.target.value, programSlug: "", modeId: "" }))}
                >
                  <option value="">Select</option>
                  {catalogData
                    .filter((item) => !window_ || areaWindowOpen(window_, item.slug))
                    .map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Preferred course" required>
                <select
                  className={inputClass}
                  value={form.programSlug}
                  onChange={(e) => setForm((current) => ({ ...current, programSlug: e.target.value, modeId: "" }))}
                >
                  <option value="">Select</option>
                  {(category?.programs || [])
                    .filter((item) => !window_ || courseWindowOpen(window_, form.categorySlug, item.slug))
                    .map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Preferred training mode" required>
                <select className={inputClass} value={form.modeId} onChange={(e) => set("modeId", e.target.value)}>
                  <option value="">Select</option>
                  {(programModes || []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <Field label="Do you have access to a computer?" required>
                <select className={inputClass} value={form.computerAccess} onChange={(e) => set("computerAccess", e.target.value)}>
                  <option value="">Select</option>
                  <option>Yes, personal computer</option>
                  <option>Yes, shared computer</option>
                  <option>No</option>
                </select>
              </Field>
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-navy">What device do you have access to?</legend>
                {["Laptop", "Desktop", "Tablet", "Smartphone", "None"].map((item) => (
                  <label key={item} className="mr-4 mb-2 inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.devices.includes(item)} onChange={() => toggle("devices", item)} />
                    {item}
                  </label>
                ))}
              </fieldset>
              <Field label="Current technology skill level" required>
                <select className={inputClass} value={form.skillLevel} onChange={(e) => set("skillLevel", e.target.value)}>
                  <option value="">Select</option>
                  {["Beginner", "Basic", "Intermediate", "Advanced"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Have you previously taken a technology course?">
                <select className={inputClass} value={form.previousTechCourse} onChange={(e) => set("previousTechCourse", e.target.value)}>
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </Field>
              {form.previousTechCourse === "Yes" ? (
                <>
                  <Field label="Course name">
                    <input className={inputClass} value={form.previousCourseName} onChange={(e) => set("previousCourseName", e.target.value)} />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Institution">
                      <input className={inputClass} value={form.previousInstitution} onChange={(e) => set("previousInstitution", e.target.value)} />
                    </Field>
                    <Field label="Year completed">
                      <input className={inputClass} value={form.previousYear} onChange={(e) => set("previousYear", e.target.value)} />
                    </Field>
                  </div>
                </>
              ) : null}
              {extra ? (
                <>
                  <Field label={extra.question}>
                    <input className={inputClass} value={form.extraAnswer} onChange={(e) => set("extraAnswer", e.target.value)} />
                  </Field>
                  {extra.options ? (
                    <fieldset>
                      <legend className="mb-2 text-sm font-semibold text-navy">{extra.optionsLabel}</legend>
                      {extra.options.map((item) => (
                        <label key={item} className="mr-4 mb-2 inline-flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={form.extraLanguages.includes(item)} onChange={() => toggle("extraLanguages", item)} />
                          {item}
                        </label>
                      ))}
                    </fieldset>
                  ) : null}
                </>
              ) : null}
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-navy">Existing skills</legend>
                {[
                  "Microsoft Word",
                  "Microsoft Excel",
                  "PowerPoint",
                  "Programming",
                  "Web Development",
                  "Database Management",
                  "Data Analysis",
                  "Networking",
                  "Cyber Security",
                  "Computer Hardware",
                  "Graphic Design",
                  "Digital Marketing",
                  "None",
                  "Other",
                ].map((item) => (
                  <label key={item} className="mr-4 mb-2 inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.skills.includes(item)} onChange={() => toggle("skills", item)} />
                    {item}
                  </label>
                ))}
              </fieldset>
            </>
          ) : null}

          {step === 5 ? (
            <>
              <Field label="Why do you want to study this program?" required>
                <textarea rows="4" className={inputClass} value={form.whyStudy} onChange={(e) => set("whyStudy", e.target.value)} />
              </Field>
              <Field label="What do you hope to achieve after completing the program?" required>
                <textarea rows="4" className={inputClass} value={form.hopeToAchieve} onChange={(e) => set("hopeToAchieve", e.target.value)} />
              </Field>
              <Field label="What are your career goals?" required>
                <textarea rows="4" className={inputClass} value={form.careerGoals} onChange={(e) => set("careerGoals", e.target.value)} />
              </Field>
              <Field label="Do you currently work or run a business?">
                <select className={inputClass} value={form.currentlyWorking} onChange={(e) => set("currentlyWorking", e.target.value)}>
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </Field>
              {form.currentlyWorking === "Yes" ? (
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label="Occupation / business">
                    <input className={inputClass} value={form.occupation} onChange={(e) => set("occupation", e.target.value)} />
                  </Field>
                  <Field label="Organization">
                    <input className={inputClass} value={form.organization} onChange={(e) => set("organization", e.target.value)} />
                  </Field>
                  <Field label="Position">
                    <input className={inputClass} value={form.position} onChange={(e) => set("position", e.target.value)} />
                  </Field>
                </div>
              ) : null}
              <Field label="Have you worked on any technology-related projects?">
                <select className={inputClass} value={form.hasProjects} onChange={(e) => set("hasProjects", e.target.value)}>
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </Field>
              {form.hasProjects === "Yes" ? (
                <>
                  <Field label="Project description">
                    <textarea rows="3" className={inputClass} value={form.projectDescription} onChange={(e) => set("projectDescription", e.target.value)} />
                  </Field>
                  <Field label="Project link">
                    <input className={inputClass} value={form.projectLink} onChange={(e) => set("projectLink", e.target.value)} />
                  </Field>
                </>
              ) : null}
              <Field label="What do you expect from HassAz Tech Hub?">
                <textarea rows="3" className={inputClass} value={form.expectations} onChange={(e) => set("expectations", e.target.value)} />
              </Field>
              <Field label="What area would you most like to improve?">
                <input className={inputClass} value={form.improveArea} onChange={(e) => set("improveArea", e.target.value)} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Interested in practical projects?">
                  <select className={inputClass} value={form.practicalProjects} onChange={(e) => set("practicalProjects", e.target.value)}>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </Field>
                <Field label="Internship / career opportunities?">
                  <select className={inputClass} value={form.internships} onChange={(e) => set("internships", e.target.value)}>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </Field>
                <Field label="Entrepreneurship / startups?">
                  <select className={inputClass} value={form.entrepreneurship} onChange={(e) => set("entrepreneurship", e.target.value)}>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </Field>
              </div>
            </>
          ) : null}

          {step === 6 ? (
            <>
              <Field label="How did you hear about HassAz Tech Hub?">
                <select className={inputClass} value={form.source} onChange={(e) => set("source", e.target.value)}>
                  <option value="">Select</option>
                  {["Facebook", "Instagram", "TikTok", "WhatsApp", "Google/Search", "Friend", "Family", "School/College", "Event", "Referral", "Other"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
              {form.source === "Other" ? (
                <Field label="Please specify">
                  <input className={inputClass} value={form.sourceOther} onChange={(e) => set("sourceOther", e.target.value)} />
                </Field>
              ) : null}
              <Field label="Documents (optional)">
                <textarea
                  rows="3"
                  className={inputClass}
                  placeholder="You can email ID, certificates, or a photo later to hassaztechhub@gmail.com. Nothing is required to submit."
                  value={form.documentsNote}
                  onChange={(e) => set("documentsNote", e.target.value)}
                />
              </Field>
            </>
          ) : null}

          {step === 7 ? (
            <>
              <div className="rounded-2xl bg-soft p-4 text-sm text-navy">
                <p><span className="font-semibold">Applicant:</span> {form.fullName}</p>
                <p className="mt-1"><span className="font-semibold">Course:</span> {program?.title || "—"}</p>
                <p className="mt-1"><span className="font-semibold">Mode:</span> {mode?.label || "—"}</p>
                <p className="mt-1"><span className="font-semibold">Email:</span> {form.email}</p>
              </div>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={form.accuracy} onChange={(e) => set("accuracy", e.target.checked)} className="mt-1" />
                I confirm that the information provided in this application is accurate and complete.
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={form.processingConsent} onChange={(e) => set("processingConsent", e.target.checked)} className="mt-1" />
                I consent to HassAz Tech Hub collecting and using my information to process this application and communicate about training programs.
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={form.marketingConsent} onChange={(e) => set("marketingConsent", e.target.checked)} className="mt-1" />
                Optional: I consent to HassAz Tech Hub using photos or videos I appear in for marketing.
              </label>
            </>
          ) : null}

          {status ? (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {statusTitle ? <p className="font-bold">{statusTitle}</p> : null}
              <p className={statusTitle ? "mt-1 font-semibold" : "font-semibold"}>{status}</p>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            {step > 0 ? (
              <button
                type="button"
                className="rounded-full border border-navy/20 px-6 py-3 font-semibold text-navy"
                onClick={() => {
                  setStatus("");
                  setStep((value) => value - 1);
                }}
              >
                Back
              </button>
            ) : null}
            <button type="submit" className="rounded-full bg-gold px-6 py-3 font-semibold text-white hover:bg-gold-dark">
              {step === STEPS.length - 1 ? "Submit application" : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function ApplicationsClosed({ window: appWindow, onReached }) {
  const opensAt = appWindow.reason === "not-yet-open" && appWindow.openAt ? new Date(appWindow.openAt) : null;
  const closedAt = appWindow.reason === "closed" && appWindow.closeAt ? new Date(appWindow.closeAt) : null;

  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-sm font-semibold text-gold">Course applications</p>
      <h1 className="font-heading mt-2 text-3xl font-bold text-navy">
        No application windows that are open, Kindly Contact Academic Director For HassAz Tech Hub
      </h1>
      {opensAt ? (
        <>
          <p className="mt-4 text-sm leading-6 text-muted">
            The next application window opens on{" "}
            <span className="font-semibold text-navy">
              {opensAt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} at{" "}
              {opensAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </span>
            . Please check back then.
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
          . Follow our contact page or WhatsApp for the next intake announcement.
        </p>
      ) : (
        <p className="mt-4 text-sm leading-6 text-muted">
          We are not accepting applications right now. Please check back soon or reach out to us for the next
          intake date.
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/contact" className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-white hover:bg-gold-dark">
          Contact us
        </Link>
        <Link to="/courses" className="rounded-full border border-navy/20 px-6 py-3 text-sm font-semibold text-navy">
          View courses
        </Link>
      </div>
    </section>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-navy">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

function extraPrompt(categorySlug) {
  if (categorySlug === "software-engineering") {
    return {
      question: "Do you have programming experience? If yes, tell us briefly.",
      optionsLabel: "Which programming languages do you know?",
      options: ["Python", "JavaScript", "Java", "C/C++", "PHP", "Dart", "Other"],
    };
  }
  if (categorySlug === "cyber-security") {
    return {
      question: "Have you worked with computer networks before?",
      optionsLabel: "Which of these have you used?",
      options: ["Cisco", "Routing", "Switching", "Network configuration", "Network security", "None"],
    };
  }
  if (categorySlug === "data-courses") {
    return {
      question: "Which data tools have you used so far?",
      optionsLabel: "Select any that apply",
      options: ["Excel", "SQL", "Power BI", "Python", "None"],
    };
  }
  if (categorySlug === "ai") {
    return {
      question: "How do you currently use AI tools (if at all)?",
      optionsLabel: "Select any that apply",
      options: ["ChatGPT or similar", "Image tools", "Automation", "None yet"],
    };
  }
  if (categorySlug === "dpo") {
    return { question: "Do you currently handle personal data at work? Briefly describe." };
  }
  if (categorySlug === "high-school-bootcamp") {
    return { question: "Which school and class/form are you in?" };
  }
  return null;
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
