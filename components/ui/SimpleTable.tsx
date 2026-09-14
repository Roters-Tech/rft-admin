import { ReactNode } from 'react';

interface TableColumn<T> {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
  sticky?: boolean;
}

interface SimpleTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
}

export function SimpleTable<T>({ columns, data }: SimpleTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`${column.sticky ? 'sticky left-0 bg-white table-sticky-shadow' : ''} px-4 py-3 first:pl-0`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b border-gray-100 transition-all duration-200 ease-in-out hover:bg-brand-navy-light/30">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`${column.sticky ? 'sticky left-0 bg-white table-sticky-shadow' : ''} px-4 py-4 first:pl-0`}
                >
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
