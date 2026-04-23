import { Suspense } from 'react';
import { GolfMajorsApp } from './components/GolfMajorsApp';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GolfMajorsApp />
    </Suspense>
  );
}
