import { useState } from "react";
import "./App.css";
import anturiFlow from "./assets/anturi-flow.png";
import anturiArchitecture from "./assets/anturi-api-architecture.png";

interface Project {
  name: string;
  tag: string;
  description: string;
  stack: string[];
  link?: string;
  linkLabel?: string;
}

const techStack = [
  "Python",
  "MuleSoft",
  "React",
  "Docker",
  "SQLModel",
  "TypeScript",
  "AWS",
  "FastAPI",
  "Git",
];

const projects: Project[] = [
  {
    name: "Anturi API",
    tag: "Capstone",
    description:
      "REST API for sensor data, built with FastAPI and SQLModel and tested with pytest. The full AWS environment (ECS Fargate, RDS Postgres, ALB, Secrets Manager) is defined as code with Terraform, so it can be rebuilt on demand and torn down with one command. GitHub Actions runs the tests and Terraform checks on every push. A MuleSoft flow on CloudHub polls the API and posts sensor state changes to Slack.",
    stack: [
      "FastAPI",
      "PostgreSQL",
      "Docker",
      "Terraform",
      "AWS ECS",
      "GitHub Actions",
      "MuleSoft",
      "Slack",
    ],
    link: "https://github.com/waltterir/anturi-api",
    linkLabel: "code",
  },
  {
    name: "Book API",
    tag: "Practice project",
    description:
      "REST API for books and authors with JWT login and a pytest suite. Containerized with Docker and run on a GCP VM — my first deploy to the cloud.",
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
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  return (
    <>
      <section id="center">
        <header className="landing">
          <div className="hero"></div>
          <h1>waltteri.dev</h1>

          <div className="landing-grid">
            {/* Vasen sarake: esittely + about me */}
            <div className="intro">
              <p>
                Developer in the making, working across backend, cloud and
                integrations. Fascinated by how all the pieces fit together,
                from APIs to the infrastructure they run on.
              </p>
              <div className="aboutme">
                <h3>About me</h3>
                <p>
                  I'm a proactive learner who enjoys discovering new tech. I'm
                  fascinated by different solutions and love working my way
                  through all kinds of problems.
                </p>
                <p>
                  In my free time, I nerd out over games and tech content, and
                  occasionally lose 20+ balls in a single round of golf :)
                </p>
              </div>
            </div>

            {/* Oikea sarake: stack + opiskelu */}
            <aside className="landing-side">
              <h3>Here are some technologies I have been working with:</h3>
              <ul className="tech-list">
                {techStack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>

              <div className="learning">
                <span className="learning-label">currently learning:</span>
                <ul>
                  <li>AWS Cloud Practitioner Essentials</li>
                  <li>CI/CD with GitHub Actions</li>
                </ul>
              </div>
            </aside>
          </div>
        </header>
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
                  <div
                    className="flow-preview"
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <img
                      src={anturiArchitecture}
                      alt="Anturi API AWS architecture: ALB, ECS Fargate and RDS, built with Terraform"
                      className="flow-image-small"
                      onClick={() =>
                        setLightboxImage({
                          src: anturiArchitecture,
                          alt: "Anturi API AWS architecture, enlarged",
                        })
                      }
                    />
                    <img
                      src={anturiFlow}
                      alt="Anturi Monitor integration flow in Anypoint Studio"
                      className="flow-image-small"
                      onClick={() =>
                        setLightboxImage({
                          src: anturiFlow,
                          alt: "Anturi Monitor integration flow, enlarged",
                        })
                      }
                    />
                  </div>
                )}
                {project.name === "Anturi API" && (
                  <div className="diagram-links">
                    <button
                      className="flow-link"
                      onClick={() =>
                        setLightboxImage({
                          src: anturiArchitecture,
                          alt: "Anturi API AWS architecture, enlarged",
                        })
                      }
                    >
                      [architecture]
                    </button>{" "}
                    <button
                      className="flow-link"
                      onClick={() =>
                        setLightboxImage({
                          src: anturiFlow,
                          alt: "Anturi Monitor integration flow, enlarged",
                        })
                      }
                    >
                      [mulesoft flow]
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

      {lightboxImage && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage.src}
            alt={lightboxImage.alt}
            className="lightbox-image"
          />
        </div>
      )}
    </>
  );
}

export default App;
