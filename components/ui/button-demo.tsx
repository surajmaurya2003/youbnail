import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

function ButtonDemo() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-2 flex-wrap">
        <Button variant="default">
          Default Button
          <Sparkles className="-me-1 ms-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
        </Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">
          <Sparkles size={16} />
        </Button>
      </div>
    </div>
  );
}

export { ButtonDemo };
