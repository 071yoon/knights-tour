import Board from "@/component/board";
import Title from "@/component/title";

export default function Home() {
  return (
    <div className="flex flex-col items-center h-screen bg-gray-100 dark:bg-black pt-4">
      <Board />
    </div>
  );
}
