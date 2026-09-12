import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  ClipboardList,
  Home,
  LogOut,
  PlusCircle,
  Search,
  ShieldCheck,
  Target,
  Trophy
} from "lucide-react";

const statusClass = {
  Approved: "approved",
  Pending: "pending",
  "Under Review": "review"
};

const displayDate = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

function getCategoryName(categories, id) {
  return categories.find((category) => category.id === id)?.name || id;
}

function useJsonData() {
  const [data, setData] = useState({ students: [], categories: [], activities: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("./data/students.json").then((response) => response.json()),
      fetch("./data/categories.json").then((response) => response.json()),
      fetch("./data/activities.json").then((response) => response.json())
    ])
      .then(([students, categories, activities]) => {
        setData({ students, categories, activities });
      })
      .finally(() => setLoading(false));
  }, []);

  return { ...data, loading };
}

function ProtectedRoute({ student, children }) {
  if (!student) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Login({ students, onLogin }) {
  const navigate = useNavigate();
  const [uid, setUid] = useState("STU2026001");
  const [password, setPassword] = useState("student123");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const student = students.find((item) => item.uid === uid.trim() && item.password === password);

    if (!student) {
      setError("Invalid UID or password");
      return;
    }

    onLogin(student);
    navigate("/");
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <div>
          <p className="eyebrow">Student Activity Portal</p>
          <h1>Activity Points Management System</h1>
          <p>
            Track approved activities, submit new achievements, and follow progress toward the
            required graduation activity points.
          </p>
        </div>
        <div className="hero-stats" aria-label="Activity highlights">
          <span>
            <Trophy size={18} /> 6 categories
          </span>
          <span>
            <ShieldCheck size={18} /> JSON data
          </span>
          <span>
            <Target size={18} /> 100 point target
          </span>
        </div>
      </section>

      <form className="login-card" onSubmit={handleSubmit}>
        <div className="form-heading">
          <CircleUserRound size={28} />
          <div>
            <h2>Student Login</h2>
            <p>Use the sample credentials to enter the dashboard.</p>
          </div>
        </div>
        <label>
          UID
          <input value={uid} onChange={(event) => setUid(event.target.value)} placeholder="UID" />
        </label>
        <label>
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
        <p className="hint">Sample: STU2026001 / student123</p>
      </form>
    </main>
  );
}

function Shell({ student, onLogout, children }) {
  const navItems = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/activities", label: "Activities", icon: ClipboardList },
    { to: "/add", label: "Add", icon: PlusCircle },
    { to: "/categories", label: "Categories", icon: Award },
    { to: "/profile", label: "Profile", icon: CircleUserRound }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <Activity />
          <span>APMS</span>
        </Link>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.to === "/"}>
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <button className="logout" onClick={onLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>
      <div className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2>{student.name}</h2>
          </div>
          <div className="student-pill">
            <BookOpen size={18} />
            {student.department}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

function Dashboard({ student, activities, categories }) {
  const approvedPoints = activities.reduce((sum, item) => sum + item.pointsApproved, 0);
  const claimedPoints = activities.reduce((sum, item) => sum + item.pointsClaimed, 0);
  const pendingCount = activities.filter((item) => item.status !== "Approved").length;
  const remaining = Math.max(student.requiredPoints - approvedPoints, 0);
  const progress = Math.min(Math.round((approvedPoints / student.requiredPoints) * 100), 100);
  const recent = [...activities].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  return (
    <main className="page-grid">
      <section className="summary-panel">
        <div>
          <p className="eyebrow">Semester {student.semester}</p>
          <h1>{approvedPoints} approved points</h1>
          <p>
            {remaining} points remaining from the {student.requiredPoints}-point target.
          </p>
        </div>
        <div className="progress-ring" style={{ "--progress": `${progress}%` }}>
          <span>{progress}%</span>
        </div>
      </section>

      <section className="metric-grid">
        <Metric icon={Target} label="Required" value={student.requiredPoints} />
        <Metric icon={CheckCircle2} label="Approved" value={approvedPoints} />
        <Metric icon={ClipboardList} label="Claimed" value={claimedPoints} />
        <Metric icon={CalendarDays} label="Pending Review" value={pendingCount} />
      </section>

      <section className="wide-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Latest submissions</p>
            <h2>Recent Activities</h2>
          </div>
          <Link className="text-link" to="/activities">
            View all
          </Link>
        </div>
        <div className="activity-stack">
          {recent.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} categories={categories} />
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <article className="metric">
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ActivityList({ activities, categories }) {
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = activities.filter((activity) => {
    const matchesStatus = status === "All" || activity.status === status;
    const matchesCategory = category === "All" || activity.category === category;
    const matchesQuery = activity.title.toLowerCase().includes(query.toLowerCase());
    return matchesStatus && matchesCategory && matchesQuery;
  });

  return (
    <main className="page">
      <div className="section-head">
        <div>
          <p className="eyebrow">Submissions</p>
          <h1>Activity List</h1>
        </div>
        <Link className="primary-link" to="/add">
          <PlusCircle size={18} />
          Add Activity
        </Link>
      </div>
      <section className="filters">
        <label className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search activity"
          />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option>All</option>
          <option>Approved</option>
          <option>Pending</option>
          <option>Under Review</option>
        </select>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="All">All Categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </section>
      <section className="activity-stack">
        {filtered.map((activity) => (
          <ActivityRow key={activity.id} activity={activity} categories={categories} />
        ))}
        {filtered.length === 0 && <p className="empty">No activities match the selected filters.</p>}
      </section>
    </main>
  );
}

function ActivityRow({ activity, categories }) {
  return (
    <Link className="activity-row" to={`/activities/${activity.id}`}>
      <div>
        <h3>{activity.title}</h3>
        <p>
          {getCategoryName(categories, activity.category)} ·{" "}
          {displayDate.format(new Date(activity.date))}
        </p>
      </div>
      <div className="row-points">
        <span>{activity.pointsClaimed} claimed</span>
        <strong>{activity.pointsApproved} approved</strong>
      </div>
      <span className={`badge ${statusClass[activity.status] || "pending"}`}>
        {activity.status}
      </span>
    </Link>
  );
}

function ActivityDetails({ activities, categories }) {
  const { id } = useParams();
  const activity = activities.find((item) => String(item.id) === id);

  if (!activity) {
    return <p className="empty">Activity not found.</p>;
  }

  return (
    <main className="page">
      <Link className="text-link" to="/activities">
        Back to activities
      </Link>
      <section className="detail-panel">
        <span className={`badge ${statusClass[activity.status] || "pending"}`}>
          {activity.status}
        </span>
        <h1>{activity.title}</h1>
        <p>{activity.description}</p>
        <div className="detail-grid">
          <Metric icon={Award} label="Category" value={getCategoryName(categories, activity.category)} />
          <Metric
            icon={CalendarDays}
            label="Date"
            value={displayDate.format(new Date(activity.date))}
          />
          <Metric icon={ClipboardList} label="Claimed" value={activity.pointsClaimed} />
          <Metric icon={CheckCircle2} label="Approved" value={activity.pointsApproved} />
        </div>
      </section>
    </main>
  );
}

function AddActivity({ categories, onAdd }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    category: "technical",
    date: "",
    description: "",
    pointsClaimed: 10
  });

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onAdd({
      ...form,
      pointsClaimed: Number(form.pointsClaimed),
      pointsApproved: 0,
      status: "Pending"
    });
    navigate("/activities");
  }

  return (
    <main className="page">
      <div className="section-head">
        <div>
          <p className="eyebrow">New submission</p>
          <h1>Add Activity</h1>
        </div>
      </div>
      <form className="activity-form" onSubmit={handleSubmit}>
        <label>
          Activity Title
          <input
            required
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Enter activity title"
          />
        </label>
        <div className="form-row">
          <label>
            Category
            <select
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
            >
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              required
              type="date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
            />
          </label>
          <label>
            Points Claimed
            <input
              min="1"
              max="50"
              required
              type="number"
              value={form.pointsClaimed}
              onChange={(event) => updateField("pointsClaimed", event.target.value)}
            />
          </label>
        </div>
        <label>
          Description
          <textarea
            required
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Write a short description"
            rows="5"
          />
        </label>
        <button type="submit">Submit Activity</button>
      </form>
    </main>
  );
}

function Categories({ categories }) {
  return (
    <main className="page">
      <div className="section-head">
        <div>
          <p className="eyebrow">Approved areas</p>
          <h1>Activity Categories</h1>
        </div>
      </div>
      <section className="category-grid">
        {categories.map((category) => (
          <article className="category-card" key={category.id}>
            <Award size={24} />
            <h2>{category.name}</h2>
            <p>{category.description}</p>
            <span>{category.suggestedRange}</span>
          </article>
        ))}
      </section>
    </main>
  );
}

function Profile({ student, activities, categories }) {
  const approvedPoints = activities.reduce((sum, item) => sum + item.pointsApproved, 0);
  const byCategory = categories.map((category) => ({
    ...category,
    points: activities
      .filter((activity) => activity.category === category.id)
      .reduce((sum, item) => sum + item.pointsApproved, 0)
  }));

  return (
    <main className="page">
      <section className="profile-panel">
        <div className="avatar">{student.name.charAt(0)}</div>
        <div>
          <p className="eyebrow">Student Profile</p>
          <h1>{student.name}</h1>
          <p>
            {student.uid} · {student.department} · Semester {student.semester}
          </p>
        </div>
      </section>
      <section className="profile-grid">
        <Info label="Email" value={student.email} />
        <Info label="Phone" value={student.phone} />
        <Info label="Mentor" value={student.mentor} />
        <Info label="Batch" value={student.batch} />
        <Info label="Approved Points" value={approvedPoints} />
        <Info label="Target Points" value={student.requiredPoints} />
      </section>
      <section className="wide-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Summary</p>
            <h2>Points by Category</h2>
          </div>
        </div>
        <div className="category-summary">
          {byCategory.map((category) => (
            <div key={category.id}>
              <span>{category.name}</span>
              <strong>{category.points}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }) {
  return (
    <article className="info-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export default function App() {
  const { students, categories, activities: loadedActivities, loading } = useJsonData();
  const [student, setStudent] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (loadedActivities.length) {
      setActivities(loadedActivities);
    }
  }, [loadedActivities]);

  const studentActivities = useMemo(() => {
    if (!student) {
      return [];
    }

    return activities.filter((activity) => activity.studentUid === student.uid);
  }, [activities, student]);

  function addActivity(activity) {
    setActivities((current) => [
      {
        ...activity,
        id: Date.now(),
        studentUid: student.uid
      },
      ...current
    ]);
  }

  if (loading) {
    return <div className="loading">Loading activity portal...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login students={students} onLogin={setStudent} />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute student={student}>
            <Shell student={student} onLogout={() => setStudent(null)}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Dashboard
                      student={student}
                      activities={studentActivities}
                      categories={categories}
                    />
                  }
                />
                <Route
                  path="/activities"
                  element={<ActivityList activities={studentActivities} categories={categories} />}
                />
                <Route
                  path="/activities/:id"
                  element={<ActivityDetails activities={studentActivities} categories={categories} />}
                />
                <Route
                  path="/add"
                  element={<AddActivity categories={categories} onAdd={addActivity} />}
                />
                <Route path="/categories" element={<Categories categories={categories} />} />
                <Route
                  path="/profile"
                  element={
                    <Profile student={student} activities={studentActivities} categories={categories} />
                  }
                />
              </Routes>
            </Shell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
