import Head from "next/head";
import { TodoList } from "../components/todos/TodoList";

export default function Home() {
  return (
    <>
      <Head>
        <title>Todo App - Manage Your Tasks</title>
        <meta
          name="description"
          content="A modern todo app built with Next.js and TanStack Query"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <TodoList />
      </div>
    </>
  );
}
