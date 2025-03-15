import React, { Suspense } from "react";
import User from "../../pages/UserPage";

function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <User />
    </Suspense>
  );
}

export default Page;
