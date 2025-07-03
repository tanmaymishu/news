'use client';

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import axios, {isAxiosError} from "@/lib/axios";
import {toast} from "sonner";
import useAuth from "@/hooks/use-auth";
import {redirect} from "next/navigation";

function Forbidden() {
  const [loading, setLoading] = useState(false);
  const {user} = useAuth();

  if (user?.email_verified_at) {
    redirect('/articles');
  }

  async function sendVerificationLink() {
    try {
      setLoading(true);
      const response = await axios.post('/api/v1/email/verification-notification');
      toast.success(response.data.message)
    } catch (e: unknown) {
      console.log(e);
      if (isAxiosError(e)) {
        toast.error(e.response?.data.errors);
      } else {
        toast.error((e as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen">
      <section className="m-auto text-2xl flex items-center flex-col gap-4">
        <p className="text-xl text-center">Please verify your e-mail address to access this page.</p>
        <p className="text-xs text-center">We&#39;ve sent you a verification link to your e-mail address. Click on the
          link to verify and continue accessing the private pages.</p>
        <Button className="w-fit" onClick={sendVerificationLink} disabled={loading}>Resend Verification Link</Button>
      </section>
    </div>
  );
}

export default Forbidden;
