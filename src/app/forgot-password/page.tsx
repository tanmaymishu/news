"use client";
import React, {FormEvent, useContext, useState} from 'react';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {AuthContext} from "@/contexts/auth-context";
import Image from "next/image";
import Link from "next/link";
import {cn} from "@/lib/utils";
import axios, {isAxiosError} from "@/lib/axios";
import {AxiosResponse} from "axios";
import {toast} from "sonner";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: [],
  });
  const {isLoggedIn} = useContext(AuthContext);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const resp = await axios.post('/api/v1/forgot-password', {email});
      setEmail('');
      toast.success(resp.data.status);
    } catch (e: unknown) {
      if (isAxiosError(e) && e.status === 422) {
        console.log(e);
        setErrors(e?.response?.data.errors);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!isLoggedIn && (
        <div className="flex gap-4 justify-center items-center min-h-dvh px-4 py-8">
          <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:w-4/12">
            <CardHeader className="text-center flex flex-col items-center space-y-4 px-4 sm:px-6">
              <div className="w-full max-w-xs">
                <Image
                  src="logo.svg"
                  alt={"NewsFlow Logo"}
                  width={400}
                  height={20}
                  className="w-full h-auto"
                />
              </div>
              <CardTitle className="text-lg sm:text-xl md:text-2xl">
                Reset Password
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">E-mail</Label>
                  <Input
                    required={true}
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                  {errors.email.length > 0 && (
                    <p className="text-xs text-red-600">{errors.email.join(', ')}</p>
                  )}
                </div>

                <Button className={cn("w-full mt-2 text-sm sm:text-base py-2 sm:py-3")} disabled={loading}>
                  Send Password Reset Link
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center px-4 sm:px-6">
              <Button variant="link" asChild className="text-xs sm:text-sm text-center">
                <Link href="/login">
                  Login
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}

export default ForgotPasswordPage;
