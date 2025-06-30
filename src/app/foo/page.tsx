'use client';

import React from 'react';
import useGuard from "@/hooks/use-guard";

function FooPage() {

  useGuard();

  return (
    <div>
      hello
    </div>
  );
}

export default FooPage;
