export default function Words({ list }: { list: string[] }) {
  return (
    <p className="flex flex-wrap gap-x-2 gap-y-2">
      {list.map((word) => (
        <span key={word} className="word-chip inline-block cursor-default transition hover:-rotate-3 hover:scale-105 hover:text-ac">{word}</span>
      ))}
    </p>
  );
}
