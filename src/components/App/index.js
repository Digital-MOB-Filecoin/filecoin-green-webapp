import { lazy, Suspense } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { Spinner } from 'components/Spinner';
import { Header } from 'components/Header';

const DashboardPage = lazy(() => import('components/DashboardPage'));
const AboutPage = lazy(() => import('components/AboutPage'));

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
            <Route exact path="/" component={DashboardPage} />
            <Route exact path="/about" component={AboutPage} />

            <Redirect to="/" />
          </Switch>
        </Suspense>
      </main>
    </>
  );
}

export default App;
