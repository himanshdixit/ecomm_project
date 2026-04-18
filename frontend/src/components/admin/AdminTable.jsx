import { cn } from "@/lib/utils";

export default function AdminTable({ columns = [], emptyMessage = "No records found.", children, minWidthClassName = "min-w-[720px]" }) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
      <div className="scroll-touch overflow-x-auto">
        <table className={cn("w-full divide-y divide-slate-200 text-left text-sm text-slate-600", minWidthClassName)}>
          <thead className="bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(30,41,59,0.98))] text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-4 py-3.5 font-medium first:pl-5 last:pr-5">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {children || (
              <tr>
                <td colSpan={columns.length || 1} className="px-5 py-10 text-center text-sm text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
