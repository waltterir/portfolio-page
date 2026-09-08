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
      "Sensor data management REST API built with FastAPI and SQLModel. Tested with pytest, containerized with Docker, deployed on AWS (ECS Fargate + RDS Postgres). Integrated with a MuleSoft workflow on CloudHub that polls the API and sends Slack alerts on sensor state changes.",
    stack: [
      "FastAPI",
      "SQLModel",
      "Docker",
      "AWS ECS",
      "SQLite",
      "PostgreSQL",
      "MuleSoft",
      "Slack",
    ],
    link: "http://anturi-api-alb-1717429430.eu-north-1.elb.amazonaws.com/docs",
  },
  {
    name: "Book API",
    tag: "Practice project",
    description:
      "Production-style REST API for books and authors with JWT authentication, a pytest test suite, Docker containerization, and deployment to a GCP VM.",
    stack: ["FastAPI", "JWT", "Docker", "GCP"],
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
            Hi, I'm Waltteri. I'm finishing an IT degree at SAMK, focused on
            backend development. Most days I'm building small APIs and trying to
            learn new things. When I'm not at the keyboard, I'm usually at the
            golf course, hanging out with my girlfriend or playing games with
            friends :)
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
                [github.com/waltteri]
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

        <div className="spotify-section">
          <p>What I'm listening to:</p>
          <iframe
            data-testid="embed-iframe"
            style={{ borderRadius: "12px" }}
            src="https://open.spotify.com/embed/playlist/2yQovp9K4S9YKpV4OIlULC?utm_source=generator&theme=0"
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
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
