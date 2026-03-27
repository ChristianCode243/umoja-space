"use client";

import Link from "next/link";
import {
  Banknote,
  BookOpen,
  Briefcase,
  Cpu,
  Home,
  LogOut,
  Menu,
  Palette,
  Truck,
  UserCheck,
  UserCircle,
  UserPen,
  UserPlus,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { label: "Accueil", href: "/", icon: Home },
  { label: "Users", href: "/users", icon: Users },
  { label: "Livres", href: "/livres", icon: BookOpen },
  { label: "Auteurs", href: "/auteurs", icon: UserPen },
  { label: "Profil", href: "/profil", icon: UserCircle },
];

const clubItems: NavItem[] = [
  { label: "Clubs", href: "/clubs", icon: UsersRound },
  { label: "Ambassadeurs", href: "/ambassadeurs", icon: UserCheck },
  { label: "Membres des clubs", href: "/membres-clubs", icon: UserPlus },
];

const departmentItems: NavItem[] = [
  { label: "Finance", href: "/finance", icon: Banknote },
  { label: "Logistique", href: "/logistique", icon: Truck },
  { label: "Informatique", href: "/informatique", icon: Cpu },
  { label: "Design", href: "/designers", icon: Palette },
  { label: "Direction", href: "/direction", icon: Briefcase },
];

export function SiteNavbar() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:gap-6">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          Umja Space
        </Link>

        {/* Desktop navigation + logout */}
        <div className="hidden w-full items-center justify-end gap-3 sm:flex">
          <nav aria-label="Navigation principale">
            <NavigationMenu viewport={false} className="justify-end">
              <NavigationMenuList className="flex-wrap justify-end gap-2">
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink
                      asChild
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon className="size-4" aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-muted-foreground">
                    Clubs
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[260px] gap-1 p-2">
                      {clubItems.map((item) => (
                        <li key={item.href}>
                          <NavigationMenuLink
                            asChild
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <Link href={item.href}>
                              <item.icon className="size-4" aria-hidden="true" />
                              <span>{item.label}</span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-muted-foreground">
                    Departements
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[240px] gap-1 p-2">
                      {departmentItems.map((item) => (
                        <li key={item.href}>
                          <NavigationMenuLink
                            asChild
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <Link href={item.href}>
                              <item.icon className="size-4" aria-hidden="true" />
                              <span>{item.label}</span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          <form action={logout}>
            <Button
              type="submit"
              variant="destructive"
              size="icon"
              aria-label="Se deconnecter"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="sr-only">Se deconnecter</span>
            </Button>
          </form>
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                <Menu />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100%-2rem)]">
              <DialogHeader>
                <DialogTitle>Menu</DialogTitle>
              </DialogHeader>
              <nav aria-label="Navigation mobile">
                <ul className="mt-2 flex flex-col gap-2">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <DialogClose asChild>
                        <Link
                          href={item.href}
                          className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <item.icon className="size-4" aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      </DialogClose>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 border-t pt-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Clubs
                  </p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {clubItems.map((item) => (
                      <li key={item.href}>
                        <DialogClose asChild>
                          <Link
                            href={item.href}
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <item.icon className="size-4" aria-hidden="true" />
                            <span>{item.label}</span>
                          </Link>
                        </DialogClose>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 border-t pt-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Departements
                  </p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {departmentItems.map((item) => (
                      <li key={item.href}>
                        <DialogClose asChild>
                          <Link
                            href={item.href}
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <item.icon className="size-4" aria-hidden="true" />
                            <span>{item.label}</span>
                          </Link>
                        </DialogClose>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>

              {/* Mobile logout */}
              <form action={logout} className="mt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="destructive"
                  size="icon"
                  aria-label="Se deconnecter"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  <span className="sr-only">Se deconnecter</span>
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
