"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deletePayPeriod } from "@/actions/payPeriod";

type Props = {
  id: string;
  label: string; // e.g. "Mar 2 – Mar 15, 2026"
};

export function DeletePeriodDialog({ id, label }: Props) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, startTransition] = useTransition();

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) setTyped("");
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePayPeriod(id);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          title="Delete pay period"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="sr-only">Delete period</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Pay Period</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are about to delete{" "}
            <span className="font-medium text-foreground">{label}</span>.
            Timesheet entries within this period will not be deleted, but the
            period will no longer appear in navigation.
          </p>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">
              Type <span className="font-mono text-destructive">DELETE</span> to
              confirm
            </p>
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="DELETE"
              disabled={pending}
              autoComplete="off"
            />
          </div>
          <Button
            variant="destructive"
            className="w-full"
            disabled={typed !== "DELETE" || pending}
            onClick={handleDelete}
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Period
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
