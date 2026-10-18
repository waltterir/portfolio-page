import { MdEmail } from "react-icons/md";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const links = [
  {
    label: "GitHub",
    href: "https://github.com/waltterir",
    icon: <FaGithub />,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/waltteririihimaki/",
    icon: <FaLinkedin />,
  },
  {
    label: "Email",
    href: "mailto:riihimakiwaltteri@gmail.com",
    icon: <MdEmail />,
  },
];

export default function SocialLinks() {
  return (
    <nav className="social-links" aria-label="Social links">
      {links.map((link) => {
        const isExternal = !link.href.startsWith("mailto:");

        return (
          <a
            key={link.label}
            href={link.href}
            aria-label={link.label}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
          >
            {link.icon}
          </a>
        );
      })}
    </nav>
  );
}
