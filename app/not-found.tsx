import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-[#f5f8fb] p-4 text-center text-[#102a43]"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#0077b8]">Erro 404</p><h1 className="display mt-5 text-[clamp(3.5rem,10vw,7rem)] font-bold leading-[0.95]">Cena não encontrada.</h1><p className="mx-auto mt-7 max-w-lg text-[#627d98]">A página saiu de quadro ou nunca foi publicada.</p><Link href="/" className="button-primary mt-9"><ArrowLeft className="h-4 w-4" /> Voltar ao início</Link></div></main>;
}
