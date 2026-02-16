import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserCard } from "@/components/UserCard";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Employee, CurrentTimesheet } from "@/types";
import { api } from "@/services/api";
import { Settings, Calendar } from "lucide-react";

interface HomePageProps {
  onNavigate: (page: string, employeeId?: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentTimesheet, setCurrentTimesheet] = useState<CurrentTimesheet | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const emps = await api.getEmployees();
      setEmployees(emps);
      
      let ts = await api.getCurrentTimesheet();
      
      // If no timesheet exists, create a default one
      if (!ts) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 13); // 2 weeks
        
        await api.setCurrentTimesheet(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
        
        ts = await api.getCurrentTimesheet();
      }
      
      setCurrentTimesheet(ts);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleAdminLogin = () => {
    // Simple password check - in production, use proper authentication
    if (password === "admin123") {
      setIsAuthOpen(false);
      setPassword("");
      setError("");
      onNavigate('admin');
    } else {
      setError("Incorrect password");
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
            onClick={() => setIsAuthOpen(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Admin
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {employees.length === 0 ? (
          <div className="text-center p-12">
            <p className="text-muted-foreground mb-4">No employees found. Please add employees from the Admin panel.</p>
            <Button onClick={() => setIsAuthOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Go to Admin
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {employees.map((emp) => (
              <UserCard
                key={emp.id}
                employee={emp}
                onClick={() => onNavigate('employee', emp.id)}
              />
            ))}
          </div>
        )}
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

      {/* Admin Login Dialog */}
      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
            <DialogDescription>
              Enter the admin password to access the admin panel.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <p className="text-xs text-muted-foreground">Default password: admin123</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAuthOpen(false);
              setPassword("");
              setError("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleAdminLogin}>Login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
