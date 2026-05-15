import { NavLink, NavLinkProps } from "react-router-dom";
import { cn } from "../utils";
import styles from "./Header.module.css";

interface NavItem {
  logo?: boolean;
  name: string;
  link: string;
}

const navs: NavItem[] = [
  {
    logo: true,
    name: "Steam√ Guesser",
    link: "/",
  },
  {
    name: "Play",
    link: "/",
  },
  {
    name: "Multiplayer",
    link: "/multiplayer",
  },
  {
    name: "Game History",
    link: "/history",
  },
  {
    name: "Statistics",
    link: "/statistics",
  },
  {
    name: "Feedback",
    link: "/feedback",
  },
  {
    name: "About",
    link: "/about",
  },
  {
    name: "GitHub",
    link: "https://github.com/rudkoLA/steam-games-guesser",
  },
  {
    name: "Preferences",
    link: "/preferences",
  },
];

interface NavLinkStateProps extends Omit<NavLinkProps, "className"> {
  isActive: boolean;
}

const cn_navlink = ({ isActive }: NavLinkStateProps, item: NavItem): string => {
  return cn(
    styles.nav,
    item.logo && styles.logo,
    isActive && !item.logo && styles.active,
  );
};

const Header: React.FC = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {navs.map((item) => {
          return (
            <NavLink
              className={({ isActive }) =>
                cn_navlink({ isActive } as NavLinkStateProps, item)
              }
              key={item.name}
              to={item.link}
            >
              {item.name}
            </NavLink>
          );
        })}
      </header>
    </div>
  );
};

export default Header;
