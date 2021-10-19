import { lazy, Suspense, useRef } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { Spinner } from 'components/Spinner';
import { Header } from 'components/Header';

const LeaderboardPage = lazy(() => import('components/LeaderboardPage'));
const DataPage = lazy(() => import('components/DataPage'));
const AboutPage = lazy(() => import('components/MethodologyPage'));

function App() {
  const mainRef = useRef();

  return (
    <>
      <Header mainRef={mainRef} />
      <main ref={mainRef}>
        <Suspense
          fallback={
            <div style={{ margin: 'auto' }}>
              <Spinner width={40} height={40} />
            </div>
          }
        >
          <Switch>
            <Route exact path="/" component={DataPage} />
            <Route path="/leaderboard" component={LeaderboardPage} />
            <Route path="/methodology" component={AboutPage} />

            <Redirect to="/" />
          </Switch>
        </Suspense>
      </main>
    </>
  );
}

export default App;
