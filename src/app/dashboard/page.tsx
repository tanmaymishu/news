'use client'

import React, {useCallback, useContext, useEffect, useState} from 'react';
import {AuthContext} from "@/contexts/auth-context";
import {Button} from "@/components/ui/button";
import axios from "@/lib/axios";
import {Article, Author, Category, JsonResource, ResponseData, Source} from "@/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {AxiosResponse} from "axios";
import {Card, CardContent} from "@/components/ui/card";
import Link from "next/link";
import {redirect, usePathname, useRouter, useSearchParams} from "next/navigation";
import {XIcon} from "lucide-react";
import Head from "next/head";
import {Input} from "@/components/ui/input";
import Image from "next/image";

const baseUrl = `/api/v1/articles`;

function DashboardPage() {
  const {isLoggedIn, user, logOut} = useContext(AuthContext);

  if (!isLoggedIn) {
    redirect('/login');
  }

  const queryStrings = useSearchParams();
  const [sources, setSources] = useState<Source[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [articles, setArticles] = useState<JsonResource<Article>>();
  const [selectedSource, setSelectedSource] = useState(queryStrings.get('source') ?? '');
  const [selectedCategory, setSelectedCategory] = useState(queryStrings.get('category') ?? '');
  const [selectedAuthor, setSelectedAuthor] = useState(queryStrings.get('author') ?? '');
  const [keyword, setKeyword] = useState(queryStrings.get('keyword') ?? '');
  const [queryString, setQueryString] = useState(`?keyword=${keyword}&source=${selectedSource}&category=${selectedCategory}&author=${selectedAuthor}`);
  const [url, setUrl] = useState(baseUrl + queryString);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetchInitialData();
  }, [])

  useEffect(() => {
    fetchArticles();
  }, [url])

  useEffect(() => {
    if (selectedSource === '-') {
      setSelectedSource(() => '')
    }

    if (selectedCategory === '-') {
      setSelectedCategory(() => '')
    }

    if (selectedAuthor === '-') {
      setSelectedAuthor(() => '')
    }

    setQueryString(() => `?keyword=${keyword}&source=${selectedSource}&category=${selectedCategory}&author=${selectedAuthor}`);
    setUrl(() => baseUrl + queryString);
    router.push(pathname + queryString);
  }, [keyword, queryString, selectedSource, selectedCategory, selectedAuthor, pathname, router])

  const fetchInitialData = useCallback(async () => {
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
  }, [isLoggedIn]);

  const fetchArticles = useCallback(async () => {
    const response: AxiosResponse<JsonResource<Article>> = await axios.get(url);
    setArticles(response.data);
  }, [url, isLoggedIn])

  return (
    isLoggedIn &&
    <>
      <Head>
        <title>Dashboard</title>
      </Head>

      {/* Header */}
      <div className="flex border-b py-2 sm:py-4 px-4 items-center justify-between shadow sticky top-0 w-full bg-white z-50">
        <div className="flex items-center">
          <Image
            src="logo.svg"
            alt={"NewsFlow Logo"}
            width={180}
            height={5}
            className="w-24 sm:w-32 md:w-40 lg:w-44 h-auto"
          />
        </div>
        <div className="flex items-center gap-2">
          <section className="hidden sm:block text-sm md:text-base">{user?.email}</section>
          <section>
            <Button
              variant="link"
              className="text-red-500 text-xs sm:text-sm p-1 sm:p-2"
              onClick={logOut}
            >
              Log Out
            </Button>
          </section>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-4">
        <div className="max-w-6xl mx-auto">
          {/* Mobile: Stacked filters */}
          <div className="flex flex-col gap-3 sm:hidden">
            <div className="grid grid-cols-2 gap-2">
              <Select onValueChange={v => setSelectedSource(v)} value={selectedSource}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Source"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sources</SelectLabel>
                    {selectedSource &&
                      <SelectItem value={"-"} className="flex justify-between cursor-pointer">
                        <p>Clear Selection</p>
                        <XIcon className="w-3 h-3"/>
                      </SelectItem>
                    }
                    {sources.map(source =>
                      <SelectItem className="cursor-pointer" key={source.name} value={source.name}>
                        {source.name}
                      </SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select onValueChange={v => setSelectedCategory(v)} value={selectedCategory}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Category"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {selectedCategory &&
                      <SelectItem value={"-"} className="flex justify-between cursor-pointer">
                        <p>Clear Selection</p>
                        <XIcon className="w-3 h-3"/>
                      </SelectItem>
                    }
                    {categories.map(category =>
                      <SelectItem className="cursor-pointer" key={category.name} value={category.name}>
                        {category.name}
                      </SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Select onValueChange={v => setSelectedAuthor(v)} value={selectedAuthor}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select an author"/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Authors</SelectLabel>
                  {selectedAuthor &&
                    <SelectItem value={"-"} className="flex justify-between cursor-pointer">
                      <p>Clear Selection</p>
                      <XIcon className="w-3 h-3"/>
                    </SelectItem>
                  }
                  {authors.map(author =>
                    <SelectItem className="cursor-pointer" key={author.name} value={author.name}>
                      {author.name}
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search with keyword..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Desktop: Horizontal filters */}
          <div className="hidden sm:flex gap-4 items-center">
            <Select onValueChange={v => setSelectedSource(v)} value={selectedSource}>
              <SelectTrigger className="w-[140px] md:w-[180px]">
                <SelectValue placeholder="Select a source"/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sources</SelectLabel>
                  {selectedSource &&
                    <SelectItem value={"-"} className="flex justify-between cursor-pointer">
                      <p>Clear Selection</p>
                      <XIcon className="w-4 h-4"/>
                    </SelectItem>
                  }
                  {sources.map(source =>
                    <SelectItem className="cursor-pointer" key={source.name} value={source.name}>
                      {source.name}
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select onValueChange={v => setSelectedCategory(v)} value={selectedCategory}>
              <SelectTrigger className="w-[140px] md:w-[180px]">
                <SelectValue placeholder="Select a category"/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  {selectedCategory &&
                    <SelectItem value={"-"} className="flex justify-between cursor-pointer">
                      <p>Clear Selection</p>
                      <XIcon className="w-4 h-4"/>
                    </SelectItem>
                  }
                  {categories.map(category =>
                    <SelectItem className="cursor-pointer" key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select onValueChange={v => setSelectedAuthor(v)} value={selectedAuthor}>
              <SelectTrigger className="w-[140px] md:w-[180px]">
                <SelectValue placeholder="Select an author"/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Authors</SelectLabel>
                  {selectedAuthor &&
                    <SelectItem value={"-"} className="flex justify-between cursor-pointer">
                      <p>Clear Selection</p>
                      <XIcon className="w-4 h-4"/>
                    </SelectItem>
                  }
                  {authors.map(author =>
                    <SelectItem className="cursor-pointer" key={author.name} value={author.name}>
                      {author.name}
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search with keyword..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="flex-1 max-w-xs"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <div className="max-w-6xl mx-auto">
          {/* Pagination */}
          {articles && (
            <section className="flex gap-2 mb-4">
              {articles.links.prev && (
                <Button size="sm" asChild>
                  <Link href={`${window.location.toString().replace('&page=', '')}&page=` + articles.links.prev.split('page=')[1]}>
                    Prev
                  </Link>
                </Button>
              )}
              {articles.links.next && (
                <Button size="sm" asChild>
                  <Link href={`${window.location.toString().replace('&page=', '')}&page=` + articles.links.next.split('page=')[1]}>
                    Next
                  </Link>
                </Button>
              )}
            </section>
          )}

          {/* Articles */}
          <div className="flex flex-col gap-4">
            {articles?.data.map(a => (
              <Card key={a.web_url} className="rounded-lg overflow-hidden">
                <CardContent className="p-4">
                  {/* Mobile: Stacked layout */}
                  <div className="flex flex-col gap-3 sm:hidden">
                    <div className="w-full">
                      <img
                        src={a.featured_image_url}
                        alt={a.title}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="link" asChild className="text-gray-600 p-0 h-auto text-left text-base font-medium">
                        <a href={a.web_url} target="_blank" className="line-clamp-3">
                          {a.title}
                        </a>
                      </Button>
                      <div className="text-xs text-gray-500 italic">
                        Published On: {new Date(a.published_at).toDateString()}
                      </div>
                      <div className="text-sm text-gray-700 line-clamp-3">
                        <div dangerouslySetInnerHTML={{__html: a.content}}/>
                      </div>
                    </div>
                  </div>

                  {/* Desktop: Horizontal layout */}
                  <div className="hidden sm:flex gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={a.featured_image_url}
                        alt={a.title}
                        className="w-32 md:w-36 lg:w-40 h-24 md:h-28 lg:h-32 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <Button variant="link" asChild className="text-gray-600 p-0 h-auto text-left text-lg md:text-xl font-medium">
                        <a href={a.web_url} target="_blank" className="line-clamp-2">
                          {a.title.slice(0, 80)}...
                        </a>
                      </Button>
                      <div className="text-xs text-gray-500 italic">
                        Published On: {new Date(a.published_at).toDateString()}
                      </div>
                      <div className="text-sm md:text-base text-gray-700 line-clamp-3">
                        <div dangerouslySetInnerHTML={{__html: a.content}}/>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
