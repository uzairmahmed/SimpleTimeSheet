import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Employee, TimesheetEntry, CurrentTimesheet } from "@/types";
import { api } from "@/services/api";
import { ArrowLeft, Save } from "lucide-react";

interface EmployeePageProps {
  employeeId: string;
  onNavigate: (page: string) => void;
}

export function EmployeePage({ employeeId, onNavigate }: EmployeePageProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [currentTimesheet, setCurrentTimesheet] = useState<CurrentTimesheet | null>(null);
  const [entries, setEntries] = useState<{ [key: string]: number }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const loadData = async () => {
    try {
      const ts = await api.getCurrentTimesheet();
      setCurrentTimesheet(ts);
      
      if (ts) {
        // Generate dates for the timesheet period
        const startDate = new Date(ts.start_date);
        const endDate = new Date(ts.end_date);
        const dateArray: string[] = [];
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          dateArray.push(new Date(d).toISOString().split('T')[0]);
        }
        
        setDates(dateArray);
        
        // Load existing entries
        const timesheetEntries = await api.getEmployeeTimesheet(
          employeeId,
          ts.start_date,
          ts.end_date
        );
        
        const entriesMap: { [key: string]: number } = {};
        const notesMap: { [key: string]: string } = {};
        
        timesheetEntries.forEach((entry) => {
          entriesMap[entry.date] = entry.hours;
          notesMap[entry.date] = entry.notes;
        });
        
        setEntries(entriesMap);
        setNotes(notesMap);
      }
      
      // Load employee info
      const employees = await api.getEmployees();
      const emp = employees.find(e => e.id === employeeId);
      setEmployee(emp || null);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSave = async (date: string) => {
    if (!employee) return;
    
    try {
      await api.saveTimesheetEntry(
        employeeId,
        employee.name,
        date,
        entries[date] || 0,
        notes[date] || ""
      );
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <Button variant="outline" onClick={() => onNavigate('home')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-2xl font-bold">
          {employee?.name} - Log Hours
        </h1>
        
        <div className="w-24"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {dates.map((date) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="text-lg">{formatDate(date)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Label htmlFor={`hours-${date}`}>Hours</Label>
                    <Input
                      id={`hours-${date}`}
                      type="number"
                      step="0.5"
                      value={entries[date] || 0}
                      onChange={(e) =>
                        setEntries({ ...entries, [date]: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor={`notes-${date}`}>Notes</Label>
                    <Input
                      id={`notes-${date}`}
                      value={notes[date] || ""}
                      onChange={(e) =>
                        setNotes({ ...notes, [date]: e.target.value })
                      }
                      placeholder="Optional notes for this day"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={() => handleSave(date)} size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
