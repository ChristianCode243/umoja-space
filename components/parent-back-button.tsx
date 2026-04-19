import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type ParentBackButtonProps = {
  href: string;
  label: string;
};

export function ParentBackButton({ href, label }: ParentBackButtonProps) {
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={href} className="inline-flex items-center gap-2">
        <ArrowLeft className="size-4" aria-hidden={true} />
        <span>{label}</span>
      </Link>
    </Button>
  );
}
