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
import {toast} from "sonner";
import {redirect, useSearchParams} from "next/navigation";

function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const {isLoggedIn} = useContext(AuthContext);
  const [errors, setErrors] = useState({
    token: [],
    email: [],
    password: [],
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const resp = await axios.post('/api/v1/reset-password', {
        token, email, password, password_confirmation: passwordConfirmation
      });
      setPassword('');
      setPasswordConfirmation('')
      redirect('/login');
      toast.success(resp.data.message);
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
                  <Label className="text-sm sm:text-base">New Password</Label>
                  <Input
                    required={true}
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                  {errors.password?.length > 0 && (
                    <p className="text-xs text-red-600">{errors.password.join(', ')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Confirm Password</Label>
                  <Input
                    required={true}
                    type="password"
                    value={passwordConfirmation}
                    onChange={e => setPasswordConfirmation(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                  {errors.password?.length > 0 && (
                    <p className="text-xs text-red-600">{errors.password.join(', ')}</p>
                  )}
                  {errors.email?.length > 0 && (
                    <p className="text-xs text-red-600">{errors.email.join(', ')}</p>
                  )}
                </div>

                <Button className={cn("w-full mt-2 text-sm sm:text-base py-2 sm:py-3")} disabled={loading}>
                  Reset Password
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

export default ResetPasswordPage;
