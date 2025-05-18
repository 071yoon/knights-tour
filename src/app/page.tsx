import Board from "@/component/board";
import Title from "@/component/title";

export default function Home() {
  return (
    <div className="flex flex-col items-center h-screen bg-gray-100 pt-4">
      <Title title="Knight's Tour" />
      <Board />
    </div>
  );
}
