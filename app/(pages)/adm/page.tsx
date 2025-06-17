import { MainBtn } from "@/components/buttons/MainBtn";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="flex h-[40vh] w-full items-center justify-center">
      <Link href="/adm/przepisy">
        <MainBtn>Przepisy</MainBtn>
      </Link>
    </div>
  );
}
