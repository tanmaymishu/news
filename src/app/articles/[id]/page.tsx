'use client';

import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {AxiosResponse} from "axios";
import {Article, ResponseDataSingle} from "@/types";
import axios, {isAxiosError} from "@/lib/axios";
import {toast} from "sonner";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Navbar from "@/components/navbar";
import useAuth from "@/hooks/use-auth";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import NextError from "next/error";
import {Badge} from "@/components/ui/badge";
import {ArrowLeft} from "lucide-react";

function ArticlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const {user} = useAuth();

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<Article>();
  const [errorCode, setErrorCode] = useState(0);

  async function fetchArticle(id: string) {
    try {
      const response: AxiosResponse<ResponseDataSingle<Article>> = await axios.get(`/api/v1/articles/${id}`)
      setArticle(response.data.data);
    } catch (e: unknown) {
      toast.error((e as Error).message);
      if (isAxiosError(e) && e.status === 404) {
        setErrorCode(e.status);
      }
    }
  }

  useEffect(() => {
    fetchArticle(params.id).finally(() => setLoading(false))
  }, [params.id]);

  if (errorCode) {
    return <NextError statusCode={errorCode}/>
  }

  return (
    <>
      <Navbar user={user || undefined}/>
      <div className="flex flex-col">
      <Button className="w-1/2 mx-auto mt-4" onClick={() => router.back()}><ArrowLeft/>Back</Button>
      {loading ? <p className="text-center">Loading...</p> :
        <Card className="rounded-sm mx-4 md:mx-auto md:container lg:w-1/2 my-5">
          <CardHeader className="gap-4">
            <CardTitle>{article?.title}</CardTitle>
            <CardDescription>{article?.author}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <section className="mx-auto">
              <img src={article?.featured_image_url || "https://placehold.co/600x400/png"} className="object-cover rounded-sm" width={800}/>
            </section>
            <section className="flex flex-col justify-between gap-4">
              <div className="text-sm md:text-base text-gray-700 line-clamp-3">
                <div dangerouslySetInnerHTML={{__html: article?.content || ""}}/>
              </div>
              <div className="text-xs text-gray-500 italic">
                Published On: {new Date(article?.published_at || 0).toDateString()}
              </div>
              <div className="flex gap-2">
                <Badge>{article?.category}</Badge>
                <Badge variant="secondary">{article?.source}</Badge>
              </div>
              <div><Button variant="link" size="sm" asChild className="pl-0"><a target="_blank" href={article?.web_url}>Read
                Full
                Article</a></Button>
              </div>
            </section>
          </CardContent>
        </Card>}
      </div>
      <section className="flex justify-center">
        <Button variant="link" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </section>
    </>
  );
}

export default ArticlePage;
