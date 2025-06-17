import Link from "next/link";

export default function AdminPage() {
  return <div className="w-full h-[40vh] flex items-center justify-center">
    <Link className="p-2 bg-red-500 text-white" href="/adm/przepis">Przepisy</Link>
  </div>;
}
