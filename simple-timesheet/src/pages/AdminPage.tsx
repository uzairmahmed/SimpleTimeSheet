import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Employee, CurrentTimesheet } from "@/types";
import { api } from "@/services/api";
import { ArrowLeft, Plus, Edit, Trash2, CalendarDays } from "lucide-react";

interface AdminPageProps {
  onNavigate: (page: string) => void;
}

export function AdminPage({ onNavigate }: AdminPageProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentTimesheet, setCurrentTimesheet] = useState<CurrentTimesheet | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTimesheetOpen, setIsTimesheetOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    notes: "",
    pay: 0,
  });

  const [timesheetData, setTimesheetData] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const emps = await api.getEmployees();
      setEmployees(emps);
      
      const ts = await api.getCurrentTimesheet();
      setCurrentTimesheet(ts);
      
      if (ts) {
        setTimesheetData({
          startDate: ts.start_date,
          endDate: ts.end_date,
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleCreate = async () => {
    try {
      await api.createEmployee(formData.name, formData.notes, formData.pay);
      setIsCreateOpen(false);
      setFormData({ name: "", notes: "", pay: 0 });
      loadData();
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  };

  const handleEdit = async () => {
    if (!editingEmployee?.id) return;
    
    try {
      await api.updateEmployee(editingEmployee.id, formData.name, formData.notes, formData.pay);
      setIsEditOpen(false);
      setEditingEmployee(null);
      setFormData({ name: "", notes: "", pay: 0 });
      loadData();
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    
    try {
      await api.deleteEmployee(id);
      loadData();
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const handleUpdateTimesheet = async () => {
    try {
      await api.setCurrentTimesheet(timesheetData.startDate, timesheetData.endDate);
      setIsTimesheetOpen(false);
      loadData();
    } catch (error) {
      console.error("Error updating timesheet:", error);
    }
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      notes: employee.notes,
      pay: employee.pay,
    });
    setIsEditOpen(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <Button variant="outline" onClick={() => onNavigate('home')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsTimesheetOpen(true)}>
            <CalendarDays className="mr-2 h-4 w-4" />
            Set Period
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Timesheet Info */}
      {currentTimesheet && (
        <div className="px-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Timesheet Period</CardTitle>
              <CardDescription>
                {formatDate(currentTimesheet.start_date)} - {formatDate(currentTimesheet.end_date)}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => (
            <Card key={emp.id}>
              <CardHeader>
                <CardTitle>{emp.name}</CardTitle>
                <CardDescription>${emp.pay}/hr</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{emp.notes}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(emp)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => emp.id && handleDelete(emp.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Set Timesheet Period Dialog */}
      <Dialog open={isTimesheetOpen} onOpenChange={setIsTimesheetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Timesheet Period</DialogTitle>
            <DialogDescription>
              Define the start and end dates for the current timesheet period.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={timesheetData.startDate}
                onChange={(e) => setTimesheetData({ ...timesheetData, startDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={timesheetData.endDate}
                onChange={(e) => setTimesheetData({ ...timesheetData, endDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTimesheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTimesheet}>Update Period</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Employee Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Create a new employee profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pay">Pay Rate</Label>
              <Input
                id="pay"
                type="number"
                value={formData.pay}
                onChange={(e) => setFormData({ ...formData, pay: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-pay">Pay Rate</Label>
              <Input
                id="edit-pay"
                type="number"
                value={formData.pay}
                onChange={(e) => setFormData({ ...formData, pay: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
