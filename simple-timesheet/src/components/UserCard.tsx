import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Employee } from "@/types";

interface UserCardProps {
  employee: Employee;
  onClick: () => void;
}

export function UserCard({ employee, onClick }: UserCardProps) {
  return (
    <Card
      className="cursor-pointer hover:bg-accent transition-colors"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-xl">{employee.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{employee.notes}</p>
        <p className="text-sm font-medium mt-2">${employee.pay}/hr</p>
      </CardContent>
    </Card>
  );
}
