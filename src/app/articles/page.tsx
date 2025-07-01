'use client';

import useAuth from "@/hooks/use-auth";
import Newsfeed from "@/app/articles/newsfeed";

function ArticlesPage() {
  const {isLoggedIn} = useAuth();

  if (isLoggedIn) {
    return <Newsfeed mode="customized" articleUrl="/api/v1/own-articles"/>
  }

  return <Newsfeed mode="public" articleUrl="/api/v1/articles"/>
}

export default ArticlesPage;
