"use client";
import React, {FormEvent, useContext, useState} from 'react';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import axios, {isAxiosError} from "@/lib/axios";
import {AuthContext} from "@/contexts/auth-context";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState({
    name: [],
    email: [],
    password: [],
    password_confirmation: []
  });
  const {isLoggedIn} = useContext(AuthContext);
  const router = useRouter();

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    try {
      const response = await axios.post('/api/v1/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      if (response.status === 201) {
        toast('Registration successful. Please login to continue.');
        router.push('/login');
      }
    } catch (e: unknown) {
      if (isAxiosError(e) && e.status === 422) {
        setErrors(e.response?.data.errors);
      }
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
                Create a new account
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <form className="flex flex-col gap-4" onSubmit={handleRegister}>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Name</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                  {errors.name?.length > 0 && (
                    <p className="text-xs text-red-600">{errors.name.join(', ')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">E-mail</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                  {errors.email?.length > 0 && (
                    <p className="text-xs text-red-600">{errors.email.join(', ')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Password</Label>
                  <Input
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
                    type="password"
                    value={passwordConfirmation}
                    onChange={e => setPasswordConfirmation(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                  {errors.password_confirmation?.length > 0 && (
                    <p className="text-xs text-red-600">{errors.password_confirmation.join(', ')}</p>
                  )}
                </div>

                <Button className="w-full mt-2 text-sm sm:text-base py-2 sm:py-3">
                  Register
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center px-4 sm:px-6">
              <Button variant="link" asChild className="text-xs sm:text-sm text-center">
                <Link href="/login">
                  Already have an account? Login now!
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}

export default RegisterPage;
