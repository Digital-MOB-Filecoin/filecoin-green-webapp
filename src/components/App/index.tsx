import { ReactElement } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import DataPage from 'components/DataPage';
import { Header } from 'components/Header';
import LeaderboardPage from 'components/LeaderboardPage';
import MethodologyPage from 'components/MethodologyPage';

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
