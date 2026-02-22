import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export function Unauthorized() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-8 w-8" />
            <CardTitle>Access denied</CardTitle>
          </div>
          <CardDescription>
            You don&apos;t have permission to view this page. Please sign in with
            an account that has access, or go back to the home page.
          </CardDescription>
        </CardHeader>
        <CardContent />
        <CardFooter className="flex gap-2">
          <Link href="/login">
            <Button variant="default">Sign in</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
