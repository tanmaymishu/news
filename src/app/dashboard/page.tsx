'use client'

import React, {useContext, useEffect, useState, useCallback, useMemo} from 'react';
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
import {redirect, usePathname, useRouter, useSearchParams} from "next/navigation";
import {ArrowLeft, ArrowRight, ChevronDownIcon, XIcon} from "lucide-react";
import Head from "next/head";
import {Input} from "@/components/ui/input";
import Navbar from "@/components/navbar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import { Calendar } from '@/components/ui/calendar';

const baseUrl = `/api/v1/articles`;

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Custom hook for URL state management
function useUrlState() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const filters = useMemo(() => ({
    keyword: searchParams.get('keyword') ?? '',
    source: searchParams.get('source') ?? '',
    category: searchParams.get('category') ?? '',
    author: searchParams.get('author') ?? '',
    fromDate: searchParams.get('from_date') ?? '',
    toDate: searchParams.get('to_date') ?? '',
    page: parseInt(searchParams.get('page') ?? '1', 10)
  }), [searchParams]);

  const updateUrl = useCallback((newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams();

    const updatedFilters = {...filters, ...newFilters};

    // Only add non-empty values to URL
    if (updatedFilters.keyword) params.set('keyword', updatedFilters.keyword);
    if (updatedFilters.source) params.set('source', updatedFilters.source);
    if (updatedFilters.category) params.set('category', updatedFilters.category);
    if (updatedFilters.author) params.set('author', updatedFilters.author);
    if (updatedFilters.fromDate) params.set('from_date', updatedFilters.fromDate);
    if (updatedFilters.toDate) params.set('to_date', updatedFilters.toDate);
    if (updatedFilters.page > 1) params.set('page', updatedFilters.page.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(newUrl, {scroll: false});
  }, [filters, pathname, router]);

  return {filters, updateUrl};
}

function DashboardPage() {
  const {isLoggedIn, user, loading} = useContext(AuthContext);
  const {filters, updateUrl} = useUrlState();

  // Local state for immediate UI updates (before debouncing)
  const [localKeyword, setLocalKeyword] = useState(filters.keyword);
  const [localSource, setLocalSource] = useState(filters.source);
  const [localCategory, setLocalCategory] = useState(filters.category);
  const [localAuthor, setLocalAuthor] = useState(filters.author);
  const [fromDateOpen, setFromDateOpen] = useState(false)
  const [toDateOpen, setToDateOpen] = useState(false)
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date())
  const [toDate, setToDate] = useState<Date | undefined>(new Date())

  // Debounced keyword for API calls
  const debouncedKeyword = useDebounce(localKeyword, 500);

  // Data state
  const [sources, setSources] = useState<Source[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [articles, setArticles] = useState<JsonResource<Article>>();
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [paginating, setPaginating] = useState(false);

  // Sync local state with URL when URL changes (browser back/forward)
  useEffect(() => {
    setLocalKeyword(filters.keyword);
    setLocalSource(filters.source);
    setLocalCategory(filters.category);
    setLocalAuthor(filters.author);
    setFromDate(filters.fromDate ? new Date(filters.fromDate) : new Date());
    setToDate(filters.toDate ? new Date(filters.toDate) : new Date());
  }, [filters]);

  // Update URL when filters change (debounced for keyword)
  useEffect(() => {
    if (debouncedKeyword !== filters.keyword) {
      updateUrl({keyword: debouncedKeyword, page: 1});
    }
  }, [debouncedKeyword, filters.keyword, updateUrl]);

  // Memoized API URL
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.keyword) params.set('keyword', filters.keyword);
    if (filters.source) params.set('source', filters.source);
    if (filters.category) params.set('category', filters.category);
    if (filters.author) params.set('author', filters.author);
    if (filters.fromDate) params.set('from_date', filters.fromDate);
    if (filters.toDate) params.set('to_date', filters.toDate);
    if (filters.page > 1) params.set('page', filters.page.toString());

    return `${baseUrl}?${params.toString()}`;
  }, [filters]);

  // Fetch initial data (memoized to prevent unnecessary re-fetches)
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
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  }, []);

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    setIsLoadingArticles(true);
    try {
      const response: AxiosResponse<JsonResource<Article>> = await axios.get(apiUrl);
      response.data.data = response.data.data.map(a => {
        return a.featured_image_url ? a : {...a, featured_image_url: 'https://placehold.co/600x400/png'};
      });
      setArticles(response.data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setIsLoadingArticles(false);
      setPaginating(false);
    }
  }, [apiUrl]);

  // Filter change handlers
  const handleSourceChange = useCallback((value: string) => {
    const newValue = value === '-' ? '' : value;
    setLocalSource(newValue);
    updateUrl({source: newValue, page: 1});
  }, [updateUrl]);

  const handleCategoryChange = useCallback((value: string) => {
    const newValue = value === '-' ? '' : value;
    setLocalCategory(newValue);
    updateUrl({category: newValue, page: 1});
  }, [updateUrl]);

  const handleAuthorChange = useCallback((value: string) => {
    const newValue = value === '-' ? '' : value;
    setLocalAuthor(newValue);
    updateUrl({author: newValue, page: 1});
  }, [updateUrl]);

  const handleFromDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      setFromDate(date);
      updateUrl({fromDate: date.toISOString(), page: 1});
      setFromDateOpen(false);
    }
  }, [updateUrl]);

  const handleToDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      setToDate(date);
      updateUrl({toDate: date.toISOString(), page: 1});
      setToDateOpen(false);
    }
  }, [updateUrl]);

  const handleKeywordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalKeyword(e.target.value);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPaginating(true);
    updateUrl({page: newPage});
  }, [updateUrl]);

  // Effects
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Auth redirects
  if (!isLoggedIn) {
    redirect('/login');
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn || !user) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      {/* Header */}
      <Navbar user={user}/>
      {/* Filters */}
      <div className="px-4 py-4">
        <div className="max-w-6xl mx-auto">
          {/* Mobile: Stacked filters */}
          <div className="flex flex-col gap-3 sm:hidden">
            <div className="grid grid-cols-2 gap-2">
              <Select onValueChange={handleSourceChange} value={localSource}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Source"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sources</SelectLabel>
                    {localSource && (
                      <SelectItem value="-" className="flex justify-between cursor-pointer">
                        <p>Clear Selection</p>
                        <XIcon className="w-3 h-3"/>
                      </SelectItem>
                    )}
                    {sources.map(source => (
                      <SelectItem className="cursor-pointer" key={source.name} value={source.name}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select onValueChange={handleCategoryChange} value={localCategory}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Category"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {localCategory && (
                      <SelectItem value="-" className="flex justify-between cursor-pointer">
                        <p>Clear Selection</p>
                        <XIcon className="w-3 h-3"/>
                      </SelectItem>
                    )}
                    {categories.map(category => (
                      <SelectItem className="cursor-pointer" key={category.name} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Select onValueChange={handleAuthorChange} value={localAuthor}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select an author"/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Authors</SelectLabel>
                  {localAuthor && (
                    <SelectItem value="-" className="flex justify-between cursor-pointer">
                      <p>Clear Selection</p>
                      <XIcon className="w-3 h-3"/>
                    </SelectItem>
                  )}
                  {authors.map(author => (
                    <SelectItem className="cursor-pointer" key={author.name} value={author.name}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search..."
              value={localKeyword}
              onChange={handleKeywordChange}
              className="text-sm"
            />
          </div>

          {/* Desktop: Horizontal filters */}
          <div className="hidden sm:flex gap-4 items-center">
            <Select onValueChange={handleSourceChange} value={localSource}>
              <SelectTrigger className="w-[140px] md:w-[180px]">
                <SelectValue placeholder="Select a source"/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sources</SelectLabel>
                  {localSource && (
                    <SelectItem value="-" className="flex justify-between cursor-pointer">
                      <p>Clear Selection</p>
                      <XIcon className="w-4 h-4"/>
                    </SelectItem>
                  )}
                  {sources.map(source => (
                    <SelectItem className="cursor-pointer" key={source.name} value={source.name}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select onValueChange={handleCategoryChange} value={localCategory}>
              <SelectTrigger className="w-[140px] md:w-[180px]">
                <SelectValue placeholder="Select a category"/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  {localCategory && (
                    <SelectItem value="-" className="flex justify-between cursor-pointer">
                      <p>Clear Selection</p>
                      <XIcon className="w-4 h-4"/>
                    </SelectItem>
                  )}
                  {categories.map(category => (
                    <SelectItem className="cursor-pointer" key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select onValueChange={handleAuthorChange} value={localAuthor}>
              <SelectTrigger className="w-[140px] md:w-[180px]">
                <SelectValue placeholder="Select an author"/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Authors</SelectLabel>
                  {localAuthor && (
                    <SelectItem value="-" className="flex justify-between cursor-pointer">
                      <p>Clear Selection</p>
                      <XIcon className="w-4 h-4"/>
                    </SelectItem>
                  )}
                  {authors.map(author => (
                    <SelectItem className="cursor-pointer" key={author.name} value={author.name}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="flex flex-col gap-3">
              <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-48 justify-between font-normal"
                  >
                    {fromDate ? fromDate.toLocaleDateString() : "From"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    captionLayout="dropdown"
                    onSelect={handleFromDateChange}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-3">
              <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-48 justify-between font-normal"
                  >
                    {toDate ? toDate.toLocaleDateString() : "To"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    captionLayout="dropdown"
                    onSelect={handleToDateChange}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Input
              placeholder="Search..."
              value={localKeyword}
              onChange={handleKeywordChange}
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
            <section className="flex gap-2 items-center justify-between mb-4">
              <Button
                size="sm"
                onClick={() => handlePageChange(Number(articles.links.prev?.split('page=')[1]))}
                disabled={!articles.links.prev || paginating}
              >
                <ArrowLeft/> Prev Page
              </Button>
              <p>Articles</p>
              <Button
                size="sm"
                onClick={() => handlePageChange(Number(articles.links.next?.split('page=')[1]))}
                disabled={!articles.links.next || paginating}
              >
                Next Page <ArrowRight/>
              </Button>
            </section>
          )}

          {/* Loading state */}
          {isLoadingArticles && (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Loading articles...</div>
            </div>
          )}

          {/* Articles */}
          {!isLoadingArticles && (
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
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <Button variant="link" asChild
                                className="text-gray-600 p-0 h-auto text-lg md:text-xl text-left font-medium justify-start">
                          <a href={a.web_url} target="_blank" className="line-clamp-2 text-left">
                            {a.title.slice(0, 80)}...
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
                      <div className="flex flex-col gap-2 flex-1 min-w-0 items-start">
                        <Button variant="link" asChild
                                className="text-gray-600 p-0 h-auto text-lg md:text-xl text-left font-medium justify-start">
                          <a href={a.web_url} target="_blank" className="line-clamp-2 text-left">
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

              {articles?.data.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No articles found matching your criteria.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
