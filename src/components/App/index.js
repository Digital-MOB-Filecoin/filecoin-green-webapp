import { lazy, Suspense } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { Spinner } from 'components/Spinner';
import { Header } from 'components/Header';

const LeaderboardPage = lazy(() => import('components/LeaderboardPage'));
const DataPage = lazy(() => import('components/DataPage'));
const AboutPage = lazy(() => import('components/MethodologyPage'));

function App() {
  return (
    <>
      <Header />
      <main>
        <Suspense
          fallback={
            <div style={{ margin: 'auto' }}>
              <Spinner width={40} height={40} />
            </div>
          }
        >
          <Switch>
            <Route exact path="/" component={LeaderboardPage} />
            <Route path="/data" component={DataPage} />
            <Route path="/methodology" component={AboutPage} />

            <Redirect to="/" />
          </Switch>
        </Suspense>
      </main>
    </>
  );
}

export default App;
