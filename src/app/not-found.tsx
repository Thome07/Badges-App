import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center p-4">
      <div className="bg-slate-900/50 p-8 rounded-full mb-6 border border-slate-800">
        <AlertCircle className="h-12 w-12 text-indigo-500" />
      </div>
      <h2 className="text-3xl font-mono font-bold text-slate-200 mb-2">404_NOT_FOUND</h2>
      <p className="text-slate-500 font-mono mb-8 max-w-md">
        O recurso solicitado não foi encontrado no diretório do sistema.
      </p>
      <Link href="/">
        <Button variant="outline" className="font-mono border-slate-700 hover:bg-slate-800">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retornar ao Root
        </Button>
      </Link>
    </div>
  )
}