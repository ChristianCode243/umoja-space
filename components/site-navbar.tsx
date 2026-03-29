"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { LayoutDashboard, LogOut, Menu, Building2, Coins, Truck, Users } from "lucide-react";
import type { User } from "@prisma/client";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { getVisibleSections, type AppSection } from "@/lib/access";

type SiteNavbarProps = {
  currentUser: Pick<User, "name" | "profile">;
};

type NavItem = {
  key: AppSection;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const items: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "logistique", label: "Logistique", href: "/logistique", icon: Truck },
  { key: "finance", label: "Finance", href: "/finance", icon: Coins },
  { key: "clubs", label: "Clubs", href: "/clubs", icon: Users },
  { key: "departement", label: "Departement", href: "/departement", icon: Building2 },
];

export function SiteNavbar({ currentUser }: SiteNavbarProps) {
  const visible = new Set(getVisibleSections(currentUser));
  const navItems = items.filter((item) => visible.has(item.key));

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:gap-6">
        <Link href="/dashboard" className="text-sm font-semibold tracking-wide">
          Umja Space
        </Link>

        <div className="hidden w-full items-center justify-end gap-3 sm:flex">
          <nav aria-label="Navigation principale" className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <item.icon className="size-4" aria-hidden={true} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <span className="text-xs text-muted-foreground">{currentUser.profile}</span>
          <form action={logout}>
            <Button type="submit" variant="destructive" size="icon" aria-label="Se deconnecter">
              <LogOut className="size-4" aria-hidden={true} />
              <span className="sr-only">Se deconnecter</span>
            </Button>
          </form>
        </div>

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
                          <item.icon className="size-4" aria-hidden={true} />
                          <span>{item.label}</span>
                        </Link>
                      </DialogClose>
                    </li>
                  ))}
                </ul>
              </nav>
              <form action={logout} className="mt-4 flex justify-end">
                <Button type="submit" variant="destructive" size="icon" aria-label="Se deconnecter">
                  <LogOut className="size-4" aria-hidden={true} />
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
