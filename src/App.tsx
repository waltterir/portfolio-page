import { useState } from "react";
import "./App.css";
import anturiFlow from "./assets/anturi-flow.png";

interface Project {
  name: string;
  tag: string;
  description: string;
  stack: string[];
  link?: string;
  linkLabel?: string;
}

const projects: Project[] = [
  {
    name: "Anturi API",
    tag: "Capstone",
    description:
      "Sensor data management REST API built with FastAPI and SQLModel. Tested with pytest and containerized with Docker. Previously deployed on AWS (ECS Fargate + RDS Postgres, behind an Application Load Balancer); the live demo is currently offline for cost reasons while I rebuild the infrastructure as code with Terraform. Integrated with a MuleSoft workflow on CloudHub that polls the API and sends Slack alerts on sensor state changes.",
    stack: [
      "FastAPI",
      "Python",
      "SQLModel",
      "Docker",
      "AWS ECS",
      "SQLite",
      "PostgreSQL",
      "MuleSoft",
      "Slack",
    ],
    link: "https://github.com/waltterir/anturi-api",
  },
  {
    name: "Book API",
    tag: "Practice project",
    description:
      "Production-style REST API for books and authors with JWT authentication, a pytest test suite, Docker containerization, and deployment to a GCP VM.",
    stack: ["FastAPI", "Python", "JWT", "Docker", "GCP"],
    link: "https://github.com/waltterir/book-api-fastapi",
    linkLabel: "code",
  },
  {
    name: "Smart Expense Splitter",
    tag: "Web app",
    description: "Expense-splitting app for groups.",
    stack: ["React", "TypeScript", "Vercel"],
    link: "https://smart-expense-splitter-pied.vercel.app/",
  },
];

function App() {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <section id="center">
        <div className="hero"></div>
        <div className="intro">
          <h1>waltteri.dev</h1>
          <p>
            Hi, I'm Waltteri. I'm finishing my IT degree at SAMK, focusing on
            backend development, integrations and cloud. I'm interested in
            architecture of all kinds, from APIs to infrastructure.
          </p>
        </div>

        <div className="projects-section">
          <p>Some of my projects:</p>
          <div className="projects">
            {projects.map((project) => (
              <div className="project-card" key={project.name}>
                <div className="project-header">
                  <h2>{project.name}</h2>
                  <span className="project-tag">{project.tag}</span>
                </div>
                <p>{project.description}</p>
                <div className="project-stack">
                  {project.stack.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>

                {project.name === "Anturi API" && (
                  <div className="flow-preview">
                    <img
                      src={anturiFlow}
                      alt="Anturi Monitor integration flow in Anypoint Studio"
                      className="flow-image-small"
                      onClick={() => setLightboxOpen(true)}
                    />
                    <button
                      className="flow-link"
                      onClick={() => setLightboxOpen(true)}
                    >
                      [view diagram]
                    </button>
                  </div>
                )}

                {project.link && (
                  <a href={project.link} target="_blank" rel="noreferrer">
                    [{project.linkLabel ?? "live docs"}]
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="social-section">
          <p>Find me:</p>
          <ul className="social-links">
            <li>
              <a
                href="https://github.com/waltterir"
                target="_blank"
                rel="noreferrer"
              >
                [github.com/waltterir]
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/waltteri-riihim%C3%A4ki-ba0323364/"
                target="_blank"
                rel="noreferrer"
              >
                [linkedin.com/in/waltteri]
              </a>
            </li>
          </ul>
        </div>
      </section>

      {lightboxOpen && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={anturiFlow}
            alt="Anturi Monitor integration flow, enlarged"
            className="lightbox-image"
          />
        </div>
      )}
    </>
  );
}

export default App;
