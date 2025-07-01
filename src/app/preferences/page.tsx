'use client';

import useAuth from "@/hooks/use-auth";
import {Card} from "@/components/ui/card";
import axios, {isAxiosError} from "@/lib/axios";
import {AxiosResponse} from "axios";
import {Author, Category, Preference, ResponseData, ResponseDataSingle, Source} from "@/types";
import React, {FormEvent, useCallback, useEffect, useState} from "react";
import {Label} from "@/components/ui/label";
import MultiSelect, {Option} from "@/components/ui/multi-select";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import Navbar from "@/components/navbar";
import {redirect} from "next/navigation";

function PreferencesPage() {
  const {isLoggedIn, user} = useAuth();
  if (!isLoggedIn) {
    redirect('/login');
  }
  const [preference, setPreference] = useState<Preference>();
  const [sources, setSources] = useState<Source[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);

  const [selectedSources, setSelectedSources] = useState<Option[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Option[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<Option[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function fetchPreferences() {
    const response: AxiosResponse<ResponseDataSingle<Preference>> = await axios.get('/api/v1/preferences');
    setPreference(response.data.data);

    const sourcesOptions = response.data.data?.sources?.map(s => ({label: s, value: s})) || [];
    const categoriesOptions = response.data.data?.categories?.map(c => ({label: c, value: c})) || [];
    const authorsOptions = response.data.data?.authors?.map(a => ({label: a, value: a})) || [];

    setSelectedSources(sourcesOptions);
    setSelectedCategories(categoriesOptions);
    setSelectedAuthors(authorsOptions);
  }

  const fetchInitialData = useCallback(async () => {
    try {
      const [
        {data: sources},
        {data: categories},
        {data: authors},
      ]: [
        AxiosResponse<ResponseData<Source>>,
        AxiosResponse<ResponseData<Category>>,
        AxiosResponse<ResponseData<Author>>,
      ] = await Promise.all([
        axios.get('/api/v1/sources'),
        axios.get('/api/v1/categories'),
        axios.get('/api/v1/authors'),
      ]);

      setSources(sources.data.filter(s => Boolean(s.name)));
      setCategories(categories.data.filter(c => Boolean(c.name)));
      setAuthors(authors.data.filter(a => Boolean(a.name)));
    } catch (error: unknown) {
      console.log(error);
      toast.error('Failed to fetch initial data:');
    }
  }, []);

  async function savePreferences(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const resp: AxiosResponse<ResponseDataSingle<Preference>> = await axios.patch('/api/v1/preferences', {
        sources: !!selectedSources.length ? selectedSources?.map(s => s.value) : undefined,
        categories: !!selectedCategories.length ? selectedCategories?.map(c => c.value) : undefined,
        authors: !!selectedAuthors.length ? selectedAuthors?.map(a => a.value) : undefined,
      });
      toast.success(resp.data.message);
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        toast.error(e.message);
      }
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    fetchInitialData().then(() => {
      fetchPreferences().finally(() => setLoading(false));
    });
  }, []);

  return (
    isLoggedIn && <>
      <Navbar user={user!}/>
      {loading ? <p className="text-center">Loading...</p> : <form onSubmit={savePreferences}>
        <Card className="p-4 flex mx-auto my-4 w-6/9 rounded-xs">
          <section className="flex flex-col gap-4">
            <Label>Favorite Sources</Label>
            <MultiSelect
              value={selectedSources}
              defaultOptions={preference?.sources?.map(s => ({label: s, value: s}))}
              options={sources.map(s => ({label: s.name, value: s.name}))}
              onChange={opts => setSelectedSources(opts)}
            />
          </section>
          <section className="flex flex-col gap-4">
            <Label>Favorite Categories</Label>
            <MultiSelect
              value={selectedCategories}
              defaultOptions={preference?.categories?.map(c => ({label: c, value: c}))}
              options={categories.map(c => ({label: c.name, value: c.name}))}
              onChange={opts => setSelectedCategories(opts)}
            />
          </section>
          <section className="flex flex-col gap-4">
            <Label>Favorite Authors</Label>
            <MultiSelect
              value={selectedAuthors}
              defaultOptions={preference?.authors?.map(a => ({label: a, value: a}))}
              options={authors.map(a => ({
                label: a.name,
                value: a.name
              }))}
              onChange={opts => setSelectedAuthors(opts)}
            />
          </section>
          <section>
            <Button disabled={saving}>Save Preferences</Button>
          </section>
        </Card>
      </form>}
    </>
  );
}

export default PreferencesPage;
