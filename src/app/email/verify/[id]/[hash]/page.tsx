'use client';

import React, {useEffect} from 'react';
import {useParams, useRouter, useSearchParams} from "next/navigation";
import axios from "@/lib/axios";
import {toast} from "sonner";

function EmailVerifyPage() {
  const params = useParams<{ id: string; hash: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    axios.get(`/api/v1/email/verify/${params.id}/${params.hash}?expires=${searchParams.get('expires')}&signature=${searchParams.get('signature')}`)
      .then(res => {
        toast.success(res.data.message);
        router.push('/');
      }).catch(err => {
        toast.error(err.message);
      });
  }, []);

  return (
    <div></div>
  );
}

export default EmailVerifyPage;
