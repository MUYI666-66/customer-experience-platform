import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { AnalysisCenter } from '@/features/analysis/pages/AnalysisCenter';
import { UploadPage } from '@/features/upload/pages/UploadPage';
import { PipelinePage } from '@/features/pipeline/pages/PipelinePage';
import { OverviewPage } from '@/features/overview/pages/OverviewPage';
import { DissatisfactionPage } from '@/features/dissatisfaction/pages/DissatisfactionPage';
import { SurveyPage } from '@/features/survey/pages/SurveyPage';
import { ComplaintPage } from '@/features/complaint/pages/ComplaintPage';
import { OperationsPage } from '@/features/operations/pages/OperationsPage';
import { CasesPage } from '@/features/cases/pages/CasesPage';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';
import { AlertsPage } from '@/features/alerts/pages/AlertsPage';
import { IngestionPage } from '@/features/ingestion/pages/IngestionPage';
import { AdminPage } from '@/features/admin/pages/AdminPage';
import { SystemStatus } from '@/features/system/pages/SystemStatus';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/analysis" element={<AnalysisCenter />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/dissatisfaction" element={<DissatisfactionPage />} />
            <Route path="/survey" element={<SurveyPage />} />
            <Route path="/complaint" element={<ComplaintPage />} />
            <Route path="/operations" element={<OperationsPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/ingestion" element={<IngestionPage />} />
            <Route path="/admin/sources" element={<AdminPage />} />
            <Route path="/admin/features" element={<AdminPage />} />
            <Route path="/admin/models" element={<AdminPage />} />
            <Route path="/admin/users" element={<AdminPage />} />
            <Route path="/system" element={<SystemStatus />} />
            <Route index element={<Navigate to="/analysis" replace />} />
            <Route path="*" element={<Navigate to="/analysis" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
