import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimesheetEntry, CurrentTimesheet } from "@/types";
import { api } from "@/services/api";
import { ArrowLeft } from "lucide-react";

interface ViewPageProps {
  onNavigate: (page: string) => void;
}

export function ViewPage({ onNavigate }: ViewPageProps) {
  const [currentTimesheet, setCurrentTimesheet] = useState<CurrentTimesheet | null>(null);
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const ts = await api.getCurrentTimesheet();
      setCurrentTimesheet(ts);
      
      if (ts) {
        const timesheetEntries = await api.getTimesheetEntries(
          ts.start_date,
          ts.end_date
        );
        setEntries(timesheetEntries);
      }
    } catch (error) {
      console.error("Error loading data:", error);
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

  // Group entries by employee
  const entriesByEmployee = entries.reduce((acc, entry) => {
    if (!acc[entry.employee_id]) {
      acc[entry.employee_id] = {
        name: entry.employee_name,
        entries: [],
      };
    }
    acc[entry.employee_id].entries.push(entry);
    return acc;
  }, {} as { [key: string]: { name: string; entries: TimesheetEntry[] } });

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <Button variant="outline" onClick={() => onNavigate('home')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-2xl font-bold">
          Full Timesheet View
        </h1>
        
        <div className="w-24"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {currentTimesheet && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Period: {formatDate(currentTimesheet.start_date)} - {formatDate(currentTimesheet.end_date)}
                </CardTitle>
              </CardHeader>
            </Card>
          )}

          {Object.entries(entriesByEmployee).map(([employeeId, data]) => (
            <Card key={employeeId}>
              <CardHeader>
                <CardTitle>{data.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex justify-between items-center p-2 rounded border"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{formatDate(entry.date)}</p>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground">{entry.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{entry.hours} hrs</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-2 rounded bg-muted font-bold">
                    <span>Total Hours:</span>
                    <span>
                      {data.entries.reduce((sum, entry) => sum + entry.hours, 0)} hrs
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
