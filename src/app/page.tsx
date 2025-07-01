import Newsfeed from "@/app/articles/newsfeed";

export default function Home() {
  return <Newsfeed mode="public" articleUrl="/api/v1/articles"/>
}
