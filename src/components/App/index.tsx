import { ReactElement } from 'react';
import { Navigate, Route, Routes, Outlet } from 'react-router-dom';

import { Header } from 'components/Header';
import DataPage from 'components/DataPage';
import MethodologyPage from 'components/MethodologyPage';
import LeaderboardPage from 'components/LeaderboardPage';

function AppSkeleton() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default function App(): ReactElement {
  return (
    <Routes>
      <Route path="/" element={<AppSkeleton />}>
        <Route index element={<DataPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="methodology" element={<MethodologyPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
