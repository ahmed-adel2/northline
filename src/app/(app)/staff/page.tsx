import "@/app/(app)/internal.css";
import { demoDoctors } from "@/lib/demo-data";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const staffRoles = [
  { name: "Mariam Fouad", role: "Head Receptionist", email: "mariam.f@northline.clinic", phone: "+20 100 777 8888", status: "active", joinDate: "2020-03-01" },
  { name: "Dalia Youssef", role: "Receptionist", email: "dalia.y@northline.clinic", phone: "+20 100 666 7777", status: "active", joinDate: "2023-01-10" },
  { name: "Ahmed Ramadan", role: "Dental Assistant", email: "ahmed.r@northline.clinic", phone: "+20 100 555 4444", status: "active", joinDate: "2022-09-05" },
  { name: "Nadia Samir", role: "Sterilisation Tech", email: "nadia.s@northline.clinic", phone: "+20 100 444 3333", status: "active", joinDate: "2021-06-20" },
];

export default function Team() {
  return (
    <div className="team-wrap">
      <div className="page-header">
        <div>
          <h1>Team</h1>
          <p>{demoDoctors.length} doctors · {staffRoles.length} support staff · synthetic demo data</p>
        </div>
        <button type="button" className="button button-primary">
          Add staff member <ArrowUpRight />
        </button>
      </div>

      {/* Doctors */}
      <section>
        <h2 className="section-heading">Clinical team</h2>
        <div className="team-grid">
          {demoDoctors.map((doc) => (
            <div key={doc.id} className="team-card card">
              <div className="team-card-header">
                <div className="team-avatar" style={{ background: doc.color + "22", color: doc.color }}>
                  {doc.name.replace("Dr. ", "").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <span className="team-name">{doc.name}</span>
                  <span className="team-specialty">{doc.specialty}</span>
                </div>
                <span className={`badge badge-${doc.status}`} style={{ marginLeft: "auto" }}>{doc.status}</span>
              </div>
              <dl className="team-facts">
                <div>
                  <dt>Qualifications</dt>
                  <dd>{doc.qualifications}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{doc.phone}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{doc.email}</dd>
                </div>
                <div>
                  <dt>Commission rate</dt>
                  <dd>{doc.commissionRate}%</dd>
                </div>
                <div>
                  <dt>Joined</dt>
                  <dd>{doc.joinDate}</dd>
                </div>
              </dl>
              <div className="team-schedule">
                <span className="team-facts-label">Working days</span>
                <div className="schedule-chips">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => {
                    const works = doc.schedule.some((s) => s.day.startsWith(d === "Sun" ? "Sun" : d === "Mon" ? "Mon" : d === "Tue" ? "Tue" : d === "Wed" ? "Wed" : d === "Thu" ? "Thu" : d === "Fri" ? "Fri" : "Sat"));
                    return (
                      <span key={d} className={`day-chip${works ? " day-chip-active" : ""}`}>{d}</span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Support staff */}
      <section style={{ marginTop: "2rem" }}>
        <h2 className="section-heading">Support staff</h2>
        <div className="table-wrap">
          <table className="data-table" aria-label="Support staff list">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Role</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Joined</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {staffRoles.map((s) => (
                <tr key={s.name}>
                  <td style={{ fontWeight: 550 }}>{s.name}</td>
                  <td><span className="badge badge-category">{s.role}</span></td>
                  <td style={{ fontSize: "0.82rem" }}>{s.email}</td>
                  <td className="numeric">{s.phone}</td>
                  <td className="numeric">{s.joinDate}</td>
                  <td><span className={`badge badge-${s.status}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
