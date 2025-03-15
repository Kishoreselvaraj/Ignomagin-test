"use client";
export const dynamic = "force-dynamic";

import SuperUserPage from '@/src/pages/createUser';
import React, { Suspense } from "react";

function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuperUserPage />
    </Suspense>
  );
}

export default Page;
