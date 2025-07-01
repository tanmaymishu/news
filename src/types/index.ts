export interface SimplePaginate<T> extends ResponseData<T> {
  current_page: number;
  first_page_url: string;
  from: number;
  next_page_url: string;
  path: string;
  per_page: number;
  prev_page_url: string;
  to: number;
}

export interface JsonResource<T> extends ResponseData<T> {
  links: {
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  }
  meta: SimplePaginate<T>;
}

export interface ResponseData<T> {
  data: T[];
  message: string;
}

export interface ResponseDataSingle<T> {
  data: T;
  message: string;
}

export interface Source {
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Author {
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  source: string;
  author: string;
  web_url: string;
  featured_image_url: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface Preference {
  user_id: number;
  sources: string[];
  categories: string[];
  authors: string[];
}
