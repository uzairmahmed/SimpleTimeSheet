import { useState } from 'react'
import { HomePage } from './pages/HomePage'
import { AdminPage } from './pages/AdminPage'
import { EmployeePage } from './pages/EmployeePage'
import { ViewPage } from './pages/ViewPage'

type Page = 'home' | 'admin' | 'employee' | 'view';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  const handleNavigate = (page: string, employeeId?: string) => {
    setCurrentPage(page as Page);
    if (employeeId) {
      setSelectedEmployeeId(employeeId);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
      {currentPage === 'admin' && <AdminPage onNavigate={handleNavigate} />}
      {currentPage === 'employee' && (
        <EmployeePage employeeId={selectedEmployeeId} onNavigate={handleNavigate} />
      )}
      {currentPage === 'view' && <ViewPage onNavigate={handleNavigate} />}
    </div>
  )
}

export default App
