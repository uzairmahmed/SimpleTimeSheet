"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Lock, LockOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { togglePeriodLock } from "@/actions/payPeriod";

export function LockToggleButton({
  id,
  isLocked,
}: {
  id: string;
  isLocked: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isLocked ? "outline" : "destructive"}
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await togglePeriodLock(id);
                if (result.success) toast.success(result.message);
                else toast.error(result.message);
              })
            }
          >
            {pending ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : isLocked ? (
              <LockOpen className="mr-2 h-3.5 w-3.5" />
            ) : (
              <Lock className="mr-2 h-3.5 w-3.5" />
            )}
            {isLocked ? "Unlock" : "Lock"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isLocked
            ? "Unlock this period to allow timesheet edits"
            : "Lock this period to prevent further edits and finalize payroll"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
