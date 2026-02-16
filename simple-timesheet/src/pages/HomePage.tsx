import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserCard } from "@/components/UserCard";
import { Employee, CurrentTimesheet } from "@/types";
import { api } from "@/services/api";
import { Settings, Calendar } from "lucide-react";

interface HomePageProps {
  onNavigate: (page: string, employeeId?: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentTimesheet, setCurrentTimesheet] = useState<CurrentTimesheet | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const emps = await api.getEmployees();
      setEmployees(emps);
      
      const ts = await api.getCurrentTimesheet();
      setCurrentTimesheet(ts);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Simple Timesheet</h1>
        </div>
        
        <div className="flex-1 text-center">
          {currentTimesheet && (
            <p className="text-lg">
              {formatDate(currentTimesheet.start_date)} to {formatDate(currentTimesheet.end_date)}
            </p>
          )}
        </div>
        
        <div className="flex-1 flex justify-end">
          <Button
            variant="outline"
            onClick={() => onNavigate('admin')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Admin
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {employees.map((emp) => (
            <UserCard
              key={emp.id}
              employee={emp}
              onClick={() => onNavigate('employee', emp.id)}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t">
        <div className="flex-1"></div>
        
        <div className="flex-1 text-center">
          <p className="text-sm text-muted-foreground">
            Simple Timesheet Application
          </p>
        </div>
        
        <div className="flex-1 flex justify-end">
          <Button
            variant="outline"
            onClick={() => onNavigate('view')}
          >
            <Calendar className="mr-2 h-4 w-4" />
            View Full Timesheet
          </Button>
        </div>
      </div>
    </div>
  );
}
